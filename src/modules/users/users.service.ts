import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  UpdateAvatarUSerDto,
  UpdateRoleUSerDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import handleHashPassword from 'src/utils/hashPassword';
import { isValidObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { IUser } from './users.interface';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // ====================================================================== //
  // APIs Create Users
  // ====================================================================== //
  async create(createUserDto: CreateUserDto, user: IUser) {
    // Check if email is already exist
    const isExist = await this.userModel.findWithDeleted({
      email: createUserDto.email,
    });
    if (isExist && isExist.length > 0) {
      throw new BadRequestException(
        'Tài khoản đã tồn tại! Vui lòng đăng nhập.',
      );
    }

    // Hash password
    const hashPassword = await handleHashPassword(createUserDto.password);

    return await this.userModel.create({
      ...createUserDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      password: hashPassword,
    });
  }

  // ====================================================================== //
  // APIs Fetch Users
  // ====================================================================== //
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    return await this.userModel
      .findById({ _id: id })
      .select('-password')
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  // ====================================================================== //
  // APIs Update Users
  // ====================================================================== //
  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Check if email is already exist
    const isExist = await this.userModel.findById({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Tài khoản không tồn tại. Vui lòng kiểm tra lại.',
      );
    }

    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async handleUpdateRoleUser(
    id: string,
    updateRoleDto: UpdateRoleUSerDto,
    user: IUser,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Check if email is already exist
    const isExist = await this.userModel.findById({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Tài khoản không tồn tại. Vui lòng kiểm tra lại.',
      );
    }

    return await this.userModel
      .updateOne(
        { _id: id },
        {
          role: updateRoleDto.roleId,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      )
      .select('-password');
  }

  async handleUpdateAvatarUser(
    id: string,
    updateAvatarUSerDto: UpdateAvatarUSerDto,
    user: IUser,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Check if email is already exist
    const isExist = await this.userModel.findById({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Tài khoản không tồn tại. Vui lòng kiểm tra lại.',
      );
    }

    const isAvatar = updateAvatarUSerDto.avatar
      ? updateAvatarUSerDto.avatar
      : null;

    return await this.userModel.updateOne(
      { _id: id },
      {
        avatar: isAvatar ? `/images/users/${isAvatar}` : isExist.avatar,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  // ====================================================================== //
  // APIs Delete Users
  // ====================================================================== //
  async remove(id: string, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Check if email is already exist
    const isExist = await this.userModel
      .findOne({ _id: id })
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
    if (!isExist) {
      throw new BadRequestException(
        'Tài khoản không tồn tại. Vui lòng kiểm tra lại.',
      );
    }

    // Check if the user's role is SUPER_ADMIN
    if (
      isExist.role &&
      typeof isExist.role === 'object' &&
      'name' in isExist.role &&
      isExist.role.name === 'SUPER_ADMIN'
    ) {
      throw new BadRequestException('Tài khoản này không thể xóa.');
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return await this.userModel.delete({ _id: id });
  }

  async seedUsers(count = 23) {
    for (let i = 0; i < count; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@1234', salt);

      await this.userModel.create({
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        phone: this.generateVietnamesePhoneNumber(),
        password: hashedPassword,
        roleId: new mongoose.Types.ObjectId('67ae5817814f28e7628ba6b6'),
      });
      console.log('i: ', i);
    }
    // const retust = await this.userModel.insertMany(users);
    return 'ok';
  }
  private generateVietnamesePhoneNumber(): string {
    const prefixes = [
      '032',
      '033',
      '034',
      '035',
      '036',
      '037',
      '038',
      '039',
      '052',
      '056',
      '058',
      '059',
      '070',
      '076',
      '077',
      '078',
      '079',
      '081',
      '082',
      '083',
      '084',
      '085',
      '086',
      '087',
      '088',
      '089',
      '090',
      '091',
      '092',
      '093',
      '094',
      '095',
      '096',
      '097',
      '098',
      '099',
    ];
    const prefix = faker.helpers.arrayElement(prefixes);
    const suffix = faker.string.numeric(7);
    return prefix + suffix;
  }
}

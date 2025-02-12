import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import handleHashPassword from 'src/utils/hashPassword';
import { isValidObjectId } from 'mongoose';
import aqp from 'api-query-params';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

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

    return await this.userModel.findById({ _id: id }).select('-password');
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

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

    return await this.userModel
      .updateOne(
        { _id: id },
        {
          ...updateUserDto,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      )
      .select('-password');
  }

  async remove(id: string, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Check if email is already exist
    const isExist = await this.userModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Tài khoản không tồn tại. Vui lòng kiểm tra lại.',
      );
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
}

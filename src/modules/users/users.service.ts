import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import handleHashPassword from 'src/utils/hashPassword';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email is already exist
    const isExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        'Tài khoản đã tồn tại! Vui lòng đăng nhập.',
      );
    }

    // Hash password
    const hashPassword = await handleHashPassword(createUserDto.password);

    return await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
  }

  async findAll() {
    return await this.userModel.find().select('-password');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
    return await this.userModel.findById({ _id: id }).select('-password');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    return await this.userModel
      .findOneAndUpdate({ _id: id }, { $set: updateUserDto }, { new: true })
      .select('-password');
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    return await this.userModel.delete({ _id: id });
  }
}

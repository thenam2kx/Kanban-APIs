import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import aqp from 'api-query-params';
import isValidMongoId from 'src/utils/validate.mongoid';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private rolesModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const isExist = await this.rolesModel.findOne({ name: createRoleDto.name });
    if (isExist) {
      throw new BadRequestException(
        `Vai trò ${createRoleDto.name} đã tồn tại!`,
      );
    }

    return await this.rolesModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.rolesModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.rolesModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    // Populate permissions
    return await this.rolesModel.findById({ _id: id }).populate({
      path: 'permissions',
      select: { name: 1, _id: 1, apiPath: 1, method: 1, module: 1 },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    const isExist = await this.rolesModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(`Vai trò ${isExist.name} không tồn tại!`);
    }

    return await this.rolesModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    const isExist = await this.rolesModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(`Vai trò ${isExist.name} không tồn tại!`);
    }

    if (isExist.name === 'SUPER_ADMIN') {
      throw new BadRequestException('Vai trò này không thể xóa!');
    }

    await this.rolesModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return await this.rolesModel.delete({ _id: id });
  }
}

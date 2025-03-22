import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import aqp from 'api-query-params';
import { ObjectId } from 'mongodb';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  isValidMongoId = (id: string): boolean => {
    return ObjectId.isValid(id);
  };

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { apiPath, method } = createPermissionDto;
    // Check if permission is already exist
    const isExist = await this.permissionModel.findOne({ apiPath, method });
    if (isExist) {
      throw new BadRequestException(
        `Quyền hạn với apiPath=${apiPath} , method=${method} đã tồn tại!`,
      );
    }

    // Create permission
    return await this.permissionModel.create({
      ...createPermissionDto,
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

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    // Group permissions by module
    const groupPermissions = result?.reduce(
      (acc: Record<string, string[]>, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission as any);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    // Convert groupPermissions to array
    const resultPermissions = Object.entries(groupPermissions).map(
      ([key, value]) => ({
        name: key,
        permissions: value,
      }),
    );

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result: resultPermissions,
    };
  }

  async findOne(id: string) {
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Id không hợp lệ!`);
    }

    return this.permissionModel.findById({ _id: id });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    // Check if id is valid
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Id không hợp lệ!`);
    }

    // Check if permission is already exist
    const isExist = await this.permissionModel.findById({ _id: id });
    if (!isExist) {
      throw new BadRequestException(`Quyền hạn không tồn tại!`);
    }

    // Check if api and method is already exist
    const { apiPath, method } = updatePermissionDto;
    const isExistPermission = await this.permissionModel.findOne({
      apiPath,
      method,
    });
    if (isExistPermission) {
      throw new BadRequestException(
        `Quyền hạn với apiPath=${apiPath} , method=${method} đã tồn tại!`,
      );
    }

    // Update permission
    return this.permissionModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!this.isValidMongoId(id)) {
      throw new BadRequestException(`Id không hợp lệ!`);
    }

    // Check if permission is already exist
    const isExist = await this.permissionModel.findById({ _id: id });
    if (!isExist) {
      throw new BadRequestException(`Quyền hạn không tồn tại!`);
    }

    // Soft delete permission
    await this.permissionModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.permissionModel.delete({ _id: id });
  }
}

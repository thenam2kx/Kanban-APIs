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

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Validates if a MongoDB ObjectId is valid.
   * @param id - The ID to validate.
   * @throws BadRequestException if the ID is invalid.
   */
  private validateMongoId(id: string): void {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  }

  /**
   * Checks if a permission with the given apiPath and method already exists.
   * @param apiPath - The API path of the permission.
   * @param method - The HTTP method of the permission.
   * @throws BadRequestException if the permission already exists.
   */
  private async checkPermissionExists(
    apiPath: string,
    method: string,
  ): Promise<void> {
    const isExist = await this.permissionModel.findOne({ apiPath, method });
    if (isExist) {
      throw new BadRequestException(
        `Permission with apiPath="${apiPath}" and method="${method}" already exists.`,
      );
    }
  }

  /**
   * Validates if a permission exists by ID.
   * @param id - The permission's ID.
   * @returns The permission document.
   * @throws BadRequestException if the permission does not exist.
   */
  private async validatePermissionExists(
    id: string,
  ): Promise<PermissionDocument> {
    this.validateMongoId(id);
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new BadRequestException(
        `Permission with ID "${id}" does not exist.`,
      );
    }
    return permission;
  }

  /**
   * Extracts metadata from the authenticated user.
   * @param user - The authenticated user.
   * @returns An object containing the user's ID and email.
   */
  private getUserMetadata(user: IUser): { _id: string; email: string } {
    return { _id: user._id, email: user.email };
  }

  /**
   * Groups permissions by their module field.
   * @param permissions - Array of permission documents.
   * @returns An array of objects with module names and their associated permissions.
   */
  private groupPermissionsByModule(
    permissions: PermissionDocument[],
  ): Array<{ name: string; permissions: PermissionDocument[] }> {
    const grouped = permissions.reduce(
      (acc: Record<string, PermissionDocument[]>, permission) => {
        acc[permission.module] = acc[permission.module] || [];
        acc[permission.module].push(permission);
        return acc;
      },
      {},
    );

    return Object.entries(grouped).map(([name, permissions]) => ({
      name,
      permissions,
    }));
  }

  // ====================================== //
  // =========== CRUD FUNCTIONS =========== //
  // ====================================== //

  /**
   * Creates a new permission with the provided details.
   * @param createPermissionDto - Data transfer object containing permission creation details.
   * @param user - The authenticated user performing the action.
   * @returns The created permission document.
   * @throws BadRequestException if the permission (apiPath + method) already exists.
   */
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { apiPath, method } = createPermissionDto;
    await this.checkPermissionExists(apiPath, method);

    // Create permission
    return await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: this.getUserMetadata(user),
    });
  }

  /**
   * Retrieves a paginated list of permissions, grouped by module.
   * @param currentPage - The current page number.
   * @param limit - Number of items per page.
   * @param qs - Query string for filtering, sorting, population, and projection.
   * @returns An object containing pagination metadata and grouped permission results.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = await this.permissionModel.countDocuments(filter);
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
    const groupedPermissions = this.groupPermissionsByModule(result);

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result: groupedPermissions,
    };
  }

  /**
   * Retrieves a single permission by ID.
   * @param id - The permission's ID.
   * @returns The permission document.
   * @throws BadRequestException if the ID is invalid.
   */
  async findOne(id: string) {
    this.validateMongoId(id);
    return this.permissionModel.findById(id).exec();
  }

  /**
   * Updates an existing permission.
   * @param id - The permission's ID.
   * @param updatePermissionDto - Data transfer object containing updated permission details.
   * @param user - The authenticated user performing the action.
   * @returns The updated permission document.
   * @throws BadRequestException if the ID is invalid, permission does not exist, or updated apiPath + method already exists.
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    const permission = await this.validatePermissionExists(id);

    const { apiPath, method } = updatePermissionDto;
    if (
      apiPath &&
      method &&
      (apiPath !== permission.apiPath || method !== permission.method)
    ) {
      await this.checkPermissionExists(apiPath, method);
    }

    return this.permissionModel
      .findByIdAndUpdate(
        id,
        {
          ...updatePermissionDto,
          updatedBy: this.getUserMetadata(user),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Soft deletes a permission.
   * @param id - The permission's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   * @throws BadRequestException if the ID is invalid or permission does not exist.
   */
  async remove(id: string, user: IUser) {
    await this.validatePermissionExists(id);

    await this.permissionModel.updateOne(
      { _id: id },
      { deletedBy: this.getUserMetadata(user) },
    );

    return this.permissionModel.delete({ _id: id });
  }
}

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

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Checks if a role name already exists in the database.
   * @param name - The role name to check.
   * @throws BadRequestException if the role name is already taken.
   */
  private async checkRoleNameExists(name: string): Promise<void> {
    const isExist = await this.rolesModel.findOne({ name });
    if (isExist) {
      throw new BadRequestException(`Role "${name}" already exists.`);
    }
  }

  /**
   * Validates if a MongoDB ObjectId is valid.
   * @param id - The ID to validate.
   * @throws BadRequestException if the ID is invalid.
   */
  private validateMongoId(id: string): void {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  }

  /**
   * Validates if a role exists by ID.
   * @param id - The role's ID.
   * @returns The role document.
   * @throws BadRequestException if the role does not exist.
   */
  private async validateRoleExists(id: string): Promise<RoleDocument> {
    this.validateMongoId(id);
    const role = await this.rolesModel.findById(id).exec();
    if (!role) {
      throw new BadRequestException(`Role with ID "${id}" does not exist.`);
    }
    return role;
  }

  /**
   * Extracts metadata from the authenticated user.
   * @param user - The authenticated user.
   * @returns An object containing the user's ID and email.
   */
  private getUserMetadata(user: IUser): { _id: string; email: string } {
    return { _id: user._id, email: user.email };
  }

  // ====================================== //
  // ========== CRUD FUNCTIONS ========== //
  // ====================================== //

  /**
   * Creates a new role with the provided details.
   * @param createRoleDto - Data transfer object containing role creation details.
   * @param user - The authenticated user performing the action.
   * @returns The created role document.
   * @throws BadRequestException if the role name already exists.
   */
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    await this.checkRoleNameExists(createRoleDto.name);

    return await this.rolesModel.create({
      ...createRoleDto,
      createdBy: this.getUserMetadata(user),
    });
  }

  /**
   * Retrieves a paginated list of roles based on query parameters.
   * @param currentPage - The current page number.
   * @param limit - Number of items per page.
   * @param qs - Query string for filtering, sorting, population, and projection.
   * @returns An object containing pagination metadata and role results.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
    const totalItems = await this.rolesModel.countDocuments(filter);
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
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  /**
   * Retrieves a single role by ID with populated permissions.
   * @param id - The role's ID.
   * @returns The role document with permissions populated.
   * @throws BadRequestException if the ID is invalid.
   */
  async findOne(id: string) {
    this.validateMongoId(id);

    // Populate permissions
    return await this.rolesModel
      .findById({ _id: id })
      .populate({
        path: 'permissions',
        select: 'name _id apiPath method module',
      })
      .exec();
  }

  /**
   * Updates an existing role.
   * @param id - The role's ID.
   * @param updateRoleDto - Data transfer object containing updated role details.
   * @param user - The authenticated user performing the action.
   * @returns The updated role document.
   * @throws BadRequestException if the ID is invalid or role does not exist.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    await this.validateRoleExists(id);

    return await this.rolesModel
      .findByIdAndUpdate(
        { _id: id },
        {
          ...updateRoleDto,
          updatedBy: this.getUserMetadata(user),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Soft deletes a role, preventing deletion of SUPER_ADMIN.
   * @param id - The role's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   * @throws BadRequestException if the ID is invalid, role does not exist, or role is SUPER_ADMIN.
   */
  async remove(id: string, user: IUser) {
    const role = await this.validateRoleExists(id);

    if (role.name === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete the SUPER_ADMIN role.');
    }

    await this.rolesModel.updateOne(
      { _id: id },
      { deletedBy: this.getUserMetadata(user) },
    );

    return this.rolesModel.delete({ _id: id });
  }
}

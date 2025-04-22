import { getUserMetadata, isValidObjectId } from 'src/utils/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import handleHashPassword from 'src/utils/hashPassword';
import aqp from 'api-query-params';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Checks if an email already exists in the database.
   * @param email - The email to check.
   * @throws BadRequestException if the email is already in use.
   */
  private async checkEmailExists(email: string): Promise<void> {
    const isExist = await this.userModel.findWithDeleted({ email });
    if (isExist?.length > 0) {
      throw new BadRequestException('Tài khoản đã tồn tại.');
    }
  }

  /**
   * Validates if a user exists by ID and optionally populates the role.
   * @param id - The user's ID.
   * @param populateRole - Whether to populate the role field.
   * @returns The user document.
   * @throws BadRequestException if the user does not exist.
   */
  private async validateUserExists(
    id: string,
    populateRole = false,
  ): Promise<UserDocument> {
    isValidObjectId(id);
    const query = this.userModel.findOne({ _id: id });
    if (populateRole) {
      query.populate({ path: 'role', select: 'name _id' });
    }
    const user = await query.exec();
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại.');
    }
    return user;
  }
  // ====================================== //
  // =========== CRUD FUNCTIONS =========== //
  // ====================================== //

  /**
   * Creates a new user with hashed password and checks for email uniqueness.
   * @param createUserDto - Data transfer object containing user creation details.
   * @param user - The authenticated user performing the action.
   * @returns The created user document.
   * @throws BadRequestException if the email already exists.
   */
  async create(createUserDto: CreateUserDto, user: IUser) {
    await this.checkEmailExists(createUserDto.email);

    // Hash password
    const hashPassword = await handleHashPassword(createUserDto.password);

    // Create user
    return await this.userModel.create({
      ...createUserDto,
      createdBy: getUserMetadata(user),
      password: hashPassword,
    });
  }

  /**
   * Retrieves a paginated list of users based on query parameters.
   * @param currentPage - The current page number.
   * @param limit - Number of items per page.
   * @param qs - Query string for filtering, sorting, and population.
   * @returns An object containing pagination metadata and user results.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = await this.userModel.countDocuments(filter);
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
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  /**
   * Retrieves a single user by ID, excluding the password field.
   * @param id - The user's ID.
   * @returns The user document with role populated.
   * @throws BadRequestException if the ID is invalid.
   */
  async findOne(id: string) {
    isValidObjectId(id);

    return await this.userModel
      .findById({ _id: id })
      .select('-password')
      .populate({ path: 'role', select: 'name _id' });
  }

  /**
   * Finds a user by email.
   * @param email - The user's email.
   * @returns The user document or null if not found.
   */
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  /**
   * Updates a user's details.
   * @param id - The user's ID.
   * @param updateUserDto - Data transfer object containing updated user details.
   * @param user - The authenticated user performing the action.
   * @returns The update operation result.
   * @throws BadRequestException if the ID is invalid or user does not exist.
   */
  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    await this.validateUserExists(id);

    return await this.userModel
      .findByIdAndUpdate(
        { _id: id },
        {
          ...updateUserDto,
          updatedBy: getUserMetadata(user),
        },
        { new: true },
      )
      .select('-password')
      .populate({ path: 'role', select: 'name _id' });
  }

  /**
   * Soft deletes a user, preventing deletion of SUPER_ADMIN accounts.
   * @param id - The user's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   * @throws BadRequestException if the ID is invalid, user does not exist, or user is a SUPER_ADMIN.
   */
  async remove(id: string, user: IUser) {
    isValidObjectId(id);

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
        deletedBy: getUserMetadata(user),
      },
    );

    return await this.userModel.delete({ _id: id });
  }
}

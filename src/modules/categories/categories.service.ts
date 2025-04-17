import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from '../users/users.interface';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import convertSlugUrl from 'src/utils/slugify';
import aqp from 'api-query-params';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
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
      throw new BadRequestException('ID không hợp lệ!');
    }
  }

  /**
   * Checks if an category name already exists in the database.
   * @param name - The category name to check.
   * @throws BadRequestException if the category name is already in use.
   */
  private async checkCategoryExists(name: string): Promise<void> {
    const isExist = await this.categoryModel.findWithDeleted({ name });
    if (isExist?.length > 0) {
      throw new BadRequestException('Danh mục đã tồn tại!');
    }
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
  // =========== CRUD FUNCTIONS =========== //
  // ====================================== //

  /**
   * Create a new category.
   * @param createCategoryDto - Data transfer object for creating a category.
   * @param user - The user who is creating the category.
   * @returns Created category.
   * @throws BadRequestException if category already exists.
   */
  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    await this.checkCategoryExists(createCategoryDto.name);

    // Create new category
    return await this.categoryModel.create({
      ...createCategoryDto,
      slug: convertSlugUrl(createCategoryDto.name),
      createdBy: this.getUserMetadata(user),
    });
  }

  /**
   * Fetch all categories with pagination and filtering.
   * @param currentPage - Current page number.
   * @param limit - Number of items per page.
   * @param qs - Query string for filtering and sorting.
   * @returns Paginated result with metadata.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.categoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.categoryModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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

  /**
   * Get a single category by ID.
   * @param id - Category ID.
   * @returns Found category or throws an error.
   */
  async findOne(id: string) {
    await this.validateMongoId(id);
    return await this.categoryModel.findById({ _id: id });
  }

  /**
   * Update a category by ID.
   * @param id - Category ID.
   * @param updateCategoryDto - Data transfer object for updating.
   * @param user - The user performing the update.
   * @returns Updated category.
   * @throws BadRequestException if category does not exist.
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    await this.validateMongoId(id);

    const isExist = await this.categoryModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Danh mục không tồn tại. Vui lòng kiểm tra lại',
      );
    }

    const result = await this.categoryModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateCategoryDto,
        slug: convertSlugUrl(updateCategoryDto.name),
        updatedBy: this.getUserMetadata(user),
      },
      { new: true },
    );
    return result;
  }

  /**
   * Soft delete a category by ID.
   * @param id - Category ID.
   * @param user - The user performing the deletion.
   * @returns Deletion result.
   * @throws BadRequestException if category does not exist.
   */
  async remove(id: string, user: IUser) {
    await this.validateMongoId(id);

    const isExist = await this.categoryModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Danh mục không tồn tại. Vui lòng kiểm tra lại',
      );
    }

    await this.categoryModel.updateOne(
      { _id: id },
      {
        deletedBy: this.getUserMetadata(user),
      },
    );

    return await this.categoryModel.delete({ _id: id });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  UpdateCategoryDto,
  UpdateStatusCategoryDto,
} from './dto/update-category.dto';
import { IUser } from '../users/users.interface';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import convertSlugUrl from 'src/utils/slugify';
import aqp from 'api-query-params';
import {
  getUserMetadata,
  isExistObject,
  isValidObjectId,
} from 'src/utils/utils';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
  ) {}

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
    await isExistObject(
      this.categoryModel,
      { name: createCategoryDto.name },
      { checkExisted: true, errorMessage: 'Danh mục đã tồn tại!' },
    );

    // Create new category
    return await this.categoryModel.create({
      ...createCategoryDto,
      slug: convertSlugUrl(createCategoryDto.name),
      createdBy: getUserMetadata(user),
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
    await isValidObjectId(id);
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
    await isValidObjectId(id);

    await isExistObject(
      this.categoryModel,
      { _id: id },
      { checkExisted: false, errorMessage: 'Danh mục không tồn tại!' },
    );

    const result = await this.categoryModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateCategoryDto,
        slug: convertSlugUrl(updateCategoryDto.name),
        updatedBy: getUserMetadata(user),
      },
      { new: true },
    );
    return result;
  }

  async updateStatus(
    id: string,
    updateStatusCategoryDto: UpdateStatusCategoryDto,
    user: IUser,
  ) {
    await isValidObjectId(id);

    await isExistObject(
      this.categoryModel,
      { _id: id },
      { checkExisted: false, errorMessage: 'Danh mục không tồn tại!' },
    );

    const result = await this.categoryModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          isPublic: updateStatusCategoryDto.isPublic,
          updatedBy: getUserMetadata(user),
        },
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
    await isValidObjectId(id);

    await isExistObject(
      this.categoryModel,
      { _id: id },
      { checkExisted: false, errorMessage: 'Danh mục không tồn tại!' },
    );

    await this.categoryModel.updateOne(
      { _id: id },
      {
        deletedBy: getUserMetadata(user),
      },
    );

    return await this.categoryModel.delete({ _id: id });
  }
}

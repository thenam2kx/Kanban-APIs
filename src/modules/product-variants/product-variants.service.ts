import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { isValidObjectId } from 'mongoose';
import { IUser } from '../users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductVariant,
  ProductVariantDocument,
} from './schemas/product-variant.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import aqp from 'api-query-params';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectModel(ProductVariant.name)
    private productVariantModel: SoftDeleteModel<ProductVariantDocument>,
  ) {}

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Validates if a MongoDB ObjectId is valid.
   * @param id - The ID to validate.
   * @throws BadRequestException if the ID is invalid.
   */
  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID không hợp lệ.');
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

  /**
   * Checks if a variant already exists in the database.
   * @param name - The name to check.
   * @throws BadRequestException if the name is already in use.
   */
  private async checkProductVariantExists(name: string): Promise<void> {
    const isExist = await this.productVariantModel.findWithDeleted({ name });
    if (isExist?.length > 0) {
      throw new BadRequestException('Biến thể đã tồn tại!');
    }
  }

  // ====================================== //
  // =========== CRUD FUNCTIONS =========== //
  // ====================================== //

  /**
   * Creates a new product variant.
   * @param createDto - Data to create the variant
   * @param user - The authenticated user performing the action.
   * @returns The created product variant document
   */
  async create(createProductVariantDto: CreateProductVariantDto, user: IUser) {
    await this.checkProductVariantExists(createProductVariantDto.name);

    return await this.productVariantModel.create({
      ...createProductVariantDto,
      createdBy: this.getUserMetadata(user),
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
    const totalItems = await this.productVariantModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productVariantModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .lean()
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
   * Retrieves a single product variant by ID.
   * @param id - The ID of the variant
   * @throws NotFoundException if variant not found
   * @returns The product variant document
   */
  async findOne(id: string) {
    this.validateObjectId(id);

    const variant = await this.productVariantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    }
    return variant;
  }

  /**
   * Updates an existing product variant.
   * @param id - The ID of the variant to update
   * @param updateDto - Data to update the variant
   * @throws NotFoundException if variant not found
   * @returns The updated product variant document
   */
  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
    user: IUser,
  ) {
    this.validateObjectId(id);

    const variant = await this.productVariantModel
      .findByIdAndUpdate(
        { _id: id },
        { ...updateProductVariantDto, updatedBy: this.getUserMetadata(user) },
        { new: true, runValidators: true },
      )
      .exec();
    if (!variant) {
      throw new NotFoundException('Biến thể không tồn tại!');
    }
    return variant;
  }

  /**
   * Deletes a product variant by ID.
   * @param id - The ID of the variant to delete
   * @throws NotFoundException if variant not found
   * @returns The deleted product variant document
   */
  async remove(id: string, user: IUser) {
    this.validateObjectId(id);

    const isExist = await this.productVariantModel.findById(id);
    if (!isExist) {
      throw new BadRequestException('Biến thể không tồn tại!');
    }

    await this.productVariantModel.updateOne(
      { _id: id },
      { deletedBy: this.getUserMetadata(user) },
    );

    const result = await this.productVariantModel.delete({ _id: id }).exec();
    return result;
  }
}

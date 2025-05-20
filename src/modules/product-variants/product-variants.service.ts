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
import { getUserMetadata, isExistObject } from 'src/utils/utils';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectModel(ProductVariant.name)
    private productVariantModel: SoftDeleteModel<ProductVariantDocument>,
  ) {}
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
    await isExistObject(
      this.productVariantModel,
      { name: createProductVariantDto.name },
      { checkExisted: true, errorMessage: 'Danh mục không tồn tại!' },
    );

    return await this.productVariantModel.create({
      ...createProductVariantDto,
      createdBy: getUserMetadata(user),
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
    isValidObjectId(id);

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
    isValidObjectId(id);

    const variant = await this.productVariantModel
      .findByIdAndUpdate(
        { _id: id },
        { ...updateProductVariantDto, updatedBy: getUserMetadata(user) },
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
    isValidObjectId(id);

    const isExist = await this.productVariantModel.findById(id);
    if (!isExist) {
      throw new BadRequestException('Biến thể không tồn tại!');
    }

    await this.productVariantModel.updateOne(
      { _id: id },
      { deletedBy: getUserMetadata(user) },
    );

    const result = await this.productVariantModel.delete({ _id: id }).exec();
    return result;
  }
}

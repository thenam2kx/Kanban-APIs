import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import slugify from 'src/utils/slugify';
import aqp from 'api-query-params';
import isValidMongoId from 'src/utils/validate.mongoid';
import {
  ProductVariant,
  ProductVariantDocument,
} from '../product-variants/schemas/product-variant.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,

    @InjectModel(ProductVariant.name)
    private productVariantModel: SoftDeleteModel<ProductVariantDocument>,
  ) {}

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Validates if a given ID is a valid MongoDB ObjectId.
   * @param id - The ID to validate
   * @throws BadRequestException if invalid
   */
  private validateMongoId(id: string): void {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('ID không hợp lệ');
    }
  }

  /**
   * Checks if a product exists based on a condition.
   * @param condition - MongoDB query condition
   * @param errorMessage - Custom error message
   * @throws BadRequestException if product doesn't exist
   */
  private async checkProductExists(
    condition: object,
    errorMessage: string,
  ): Promise<void> {
    const exists = await this.productModel.exists(condition).lean().exec();
    if (!exists) {
      throw new BadRequestException(errorMessage);
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
  // ========== CRUD FUNCTIONS ========== //
  // ====================================== //

  /**
   * Creates a new product with variants in a transaction.
   * @param createProductDto - Product data
   * @param user - User creating the product
   * @returns Created product with populated variants
   */
  async create(createProductDto: CreateProductDto, user: IUser) {
    // Create slug
    const slug = slugify(createProductDto.name);

    // Start a transaction session
    const session = await this.productModel.db.startSession();

    try {
      session.startTransaction();
      // Check product exists
      const isExist = await this.productModel.findOne({ slug }).lean().exec();
      if (isExist) {
        throw new BadRequestException('Sản phẩm đã tồn tại!');
      }

      // Create the product within the transaction
      const [createdProduct] = await this.productModel.create(
        [
          {
            ...createProductDto,
            slug,
            variants: [],
            createdBy: this.getUserMetadata(user),
          },
        ],
        { session },
      );

      // Create variants if provided
      if (createProductDto.variants && createProductDto.variants.length > 0) {
        const variantDocs = await this.productVariantModel.insertMany(
          createProductDto.variants.map((variantDto) => ({
            ...variantDto,
            createdBy: this.getUserMetadata(user),
            productId: createdProduct._id,
          })),
          { session },
        );

        // Update product with variant IDs
        const variantIds = variantDocs.map((v) => v._id);
        await this.productModel.updateOne(
          { _id: createdProduct._id },
          { $push: { variants: { $each: variantIds } } },
          { session },
        );
      }

      // Commit the transaction
      await session.commitTransaction();

      // Return the created product with populated variants (outside transaction)
      return this.productModel
        .findById(createdProduct._id)
        .populate('variants')
        .lean()
        .exec();
    } catch (error) {
      // Rollback the transaction if any error occurs
      await session.abortTransaction();
      throw error; // Re-throw the error to be handled by the controller
    } finally {
      session.endSession();
    }
  }

  // async create(createProductDto: CreateProductDto, user: IUser) {
  //   // Create slug
  //   const slug = slugify(createProductDto.name);

  //   // Check product exists
  //   const isExist = await this.productModel.findOne({ slug });
  //   if (isExist) {
  //     throw new BadRequestException('Sản phẩm đã tồn tại!');
  //   }

  //   // Create the product without variants
  //   const createProduct = await this.productModel.create({
  //     ...createProductDto,
  //     slug,
  //     variants: [],
  //     createdBy: {
  //       _id: user._id,
  //       email: user.email,
  //     },
  //   });

  //   // Create variants if provided
  //   if (createProductDto.variants && createProductDto.variants.length > 0) {
  //     const variantDocs = await Promise.all(
  //       createProductDto.variants.map(async (variantDto) => {
  //         const variant = new this.productVariantModel({
  //           ...variantDto,
  //           productId: createProduct._id,
  //         });
  //         return variant.save();
  //       }),
  //     );

  //     // Update product with variant IDs
  //     const variantIds = variantDocs.map((v) => v._id);
  //     await this.productModel.updateOne(
  //       { _id: createProduct._id },
  //       { $push: { variants: { $each: variantIds } } },
  //     );
  //   }

  //   // Return the created product with populated variants
  //   return this.productModel
  //     .findById(createProduct._id)
  //     .populate('variants')
  //     .exec();
  // }

  /**
   * Retrieves paginated list of products with filtering and sorting.
   * @param currentPage - Current page number
   * @param limit - Items per page
   * @param qs - Query string for filtering/sorting
   * @returns Paginated product list with metadata
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    // Optimize by running count and find in parallel
    const [totalItems, result] = await Promise.all([
      this.productModel.countDocuments(filter).exec(),
      this.productModel
        .find(filter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population ? population : { path: 'variants category' })
        .select(projection as any)
        .lean() // Improve performance with lean
        .exec(),
    ]);

    const totalPages = Math.ceil(totalItems / defaultLimit);

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
   * Retrieves a single product by ID.
   * @param id - Product ID
   * @returns Product with populated category and variants
   */
  async findOne(id: string) {
    // Check id is valid
    this.validateMongoId(id);

    const product = await this.productModel
      .findById({ _id: id })
      .populate([
        { path: 'category', select: 'name' },
        { path: 'variants', select: 'name price stock' },
      ])
      .lean()
      .exec();

    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại!');
    }
    return product;
  }

  /**
   * Updates an existing product.
   * @param id - Product ID
   * @param updateProductDto - Update data
   * @param user - User performing the update
   * @returns Updated product
   */
  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    // Check id is valid
    this.validateMongoId(id);
    // Check product exists
    await this.checkProductExists({ _id: id }, 'Sản phẩm không tồn tại!');

    return await this.productModel
      .findOneAndUpdate(
        { _id: id },
        {
          ...updateProductDto,
          slug: slugify(updateProductDto.name),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  /**
   * Soft deletes a product.
   * @param id - Product ID
   * @param user - User performing the deletion
   * @returns Deletion result
   */
  async remove(id: string, user: IUser) {
    // Check id is valid
    this.validateMongoId(id);
    // Check product exists
    await this.checkProductExists({ _id: id }, 'Sản phẩm không tồn tại!');

    await this.productModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return await this.productModel.delete({ _id: id });
  }
}

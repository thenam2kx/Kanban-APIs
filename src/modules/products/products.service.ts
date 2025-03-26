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
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  private validateMongoId(id: string) {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
  }

  // Check product exists
  private async checkProductExists(condition: object, errorMessage: string) {
    const isExist = await this.productModel.findOne(condition);
    if (!isExist) {
      throw new BadRequestException(errorMessage);
    }
  }

  async create(createProductDto: CreateProductDto, user: IUser) {
    // Create slug
    const slug = slugify(createProductDto.name);
    // Check product exists
    const isExist = await this.productModel.findOne({ slug });
    if (isExist) {
      throw new BadRequestException('Sản phẩm đã tồn tại!');
    }

    return await this.productModel.create({
      ...createProductDto,
      slug,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async createVariant(
    id: string,
    createProductDto: CreateVariantDto,
    user: IUser,
  ) {
    const currentProduct = await this.productModel.findById(id);
    if (!currentProduct) {
      throw new BadRequestException('Sản phẩm không tồn tại!');
    }

    return await this.productModel.findOneAndUpdate(
      { _id: id },
      {
        $push: { variants: createProductDto },
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productModel
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
    // Check id is valid
    this.validateMongoId(id);

    return await this.productModel
      .findById({ _id: id })
      .populate({ path: 'category', select: 'name' });
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    // Check id is valid
    this.validateMongoId(id);
    // Check product exists
    await this.checkProductExists({ _id: id }, 'Sản phẩm không tồn tại!');

    return await this.productModel.findOneAndUpdate(
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
    );
  }

  async updateVariant(
    id: string,
    variantId: string,
    createProductDto: CreateVariantDto,
    user: IUser,
  ) {
    const currentProduct = await this.productModel.findById(id);
    if (!currentProduct) {
      throw new BadRequestException('Sản phẩm không tồn tại!');
    }

    return await this.productModel.findOneAndUpdate(
      {
        _id: id,
        'variants._id': variantId,
      },
      {
        $set: {
          'variants.$.weight': createProductDto.weight,
          'variants.$.price': createProductDto.price,
          'variants.$.stock': createProductDto.stock,
          'variants.$.images': createProductDto.images,
          'variants.$.updatedAt': new Date(),
        },
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

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

  async removeVariant(id: string, variantId: string, user: IUser) {
    const currentProduct = await this.productModel.findById(id);
    if (!currentProduct) {
      throw new BadRequestException('Sản phẩm không tồn tại!');
    }

    return await this.productModel.findOneAndUpdate(
      {
        _id: id,
        'variants._id': variantId,
      },
      {
        $pull: { variants: { deleted: true } },
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }
}

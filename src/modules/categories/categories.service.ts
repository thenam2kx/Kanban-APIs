import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from '../users/users.interface';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import slugify from 'src/utils/slugify';
import aqp from 'api-query-params';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    const isExist = await this.categoryModel.findOne({
      slug: slugify(createCategoryDto.name),
    });

    if (isExist) {
      throw new BadRequestException('Danh mục đã tồn tại');
    }

    return await this.categoryModel.create({
      ...createCategoryDto,
      slug: slugify(createCategoryDto.name),
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

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

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    return await this.categoryModel.findById({ _id: id });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    const isExist = await this.categoryModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Danh mục không tồn tại. Vui lòng kiểm tra lại',
      );
    }

    return await this.categoryModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateCategoryDto,
        slug: slugify(updateCategoryDto.name),
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  async remove(id: string, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }

    const isExist = await this.categoryModel.findOne({ _id: id });
    if (!isExist) {
      throw new BadRequestException(
        'Danh mục không tồn tại. Vui lòng kiểm tra lại',
      );
    }

    await this.categoryModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return await this.categoryModel.delete({ _id: id });
  }
}

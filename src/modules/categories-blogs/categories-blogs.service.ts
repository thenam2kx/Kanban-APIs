import { Injectable } from '@nestjs/common';
import { CreateCategoriesBlogDto } from './dto/create-categories-blog.dto';
import { UpdateCategoriesBlogDto } from './dto/update-categories-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  CategoriesBlog,
  CategoriesBlogDocument,
} from './schemas/categories-blog.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import {
  getUserMetadata,
  isExistObject,
  isValidObjectId,
} from 'src/utils/utils';
import convertSlugUrl from 'src/utils/slugify';
import aqp from 'api-query-params';

@Injectable()
export class CategoriesBlogsService {
  constructor(
    @InjectModel(CategoriesBlog.name)
    private readonly categoriesBlogModel: SoftDeleteModel<CategoriesBlogDocument>,
  ) {}

  async create(createCategoriesBlogDto: CreateCategoriesBlogDto, user: IUser) {
    await isExistObject(
      this.categoriesBlogModel,
      { name: createCategoriesBlogDto.name },
      { checkExisted: true, errorMessage: 'Category đã tồn tại!' },
    );
    return await this.categoriesBlogModel.create({
      ...createCategoriesBlogDto,
      slug:
        createCategoriesBlogDto?.slug?.length > 0
          ? createCategoriesBlogDto.slug
          : convertSlugUrl(createCategoriesBlogDto.name as string),
      createdBy: getUserMetadata(user),
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = await this.categoriesBlogModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.categoriesBlogModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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

  async findOne(id: string) {
    await isValidObjectId(id);
    return await this.categoriesBlogModel.findById(id);
  }

  async update(
    id: string,
    updateCategoriesBlogDto: UpdateCategoriesBlogDto,
    user: IUser,
  ) {
    await isExistObject(
      this.categoriesBlogModel,
      { _id: id },
      { checkNotDeleted: false, errorMessage: 'Category không tồn tại' },
    );

    return await this.categoriesBlogModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateCategoriesBlogDto,
        slug:
          updateCategoriesBlogDto.slug?.length > 0
            ? updateCategoriesBlogDto.slug
            : convertSlugUrl(updateCategoriesBlogDto.name),
        updatedBy: getUserMetadata(user),
      },
      { new: true, runValidators: true },
    );
  }

  async remove(id: string, user: IUser) {
    await isValidObjectId(id);
    await this.categoriesBlogModel.updateOne(
      { _id: id },
      { deletedBy: getUserMetadata(user) },
    );
    return await this.categoriesBlogModel.delete({ _id: id });
  }
}

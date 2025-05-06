import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { SoftDeleteModel } from 'mongoose-delete';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import {
  getUserMetadata,
  isExistObject,
  isValidObjectId,
} from 'src/utils/utils';
import { IUser } from '../users/users.interface';
import convertSlugUrl from 'src/utils/slugify';
import mongoose from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsModel: SoftDeleteModel<BlogDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto, user: IUser) {
    console.log('🚀 ~ BlogsService ~ create ~ createBlogDto:', createBlogDto);
    await isExistObject(
      this.blogsModel,
      { title: createBlogDto.title },
      { checkExisted: true, errorMessage: 'Blog đã tồn tại!' },
    );
    return await this.blogsModel.create({
      ...createBlogDto,
      slug:
        createBlogDto?.slug?.length > 0
          ? createBlogDto.slug
          : convertSlugUrl(createBlogDto.title),
      author: user._id,
      createdBy: getUserMetadata(user),
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (filter.tags) {
      const tags = Array.isArray(filter.tags) ? filter.tags : [filter.tags];
      const validTags = tags.filter((id) =>
        mongoose.Types.ObjectId.isValid(id),
      );
      filter.tags =
        validTags.length > 0
          ? { $in: validTags.map((id) => new mongoose.Types.ObjectId(id)) }
          : undefined;
      if (!filter.tags) delete filter.tags;
    }

    if (filter.categories) {
      const categories = Array.isArray(filter.categories)
        ? filter.categories
        : [filter.categories];
      const validCategories = categories.filter((id) =>
        mongoose.Types.ObjectId.isValid(id),
      );
      filter.categories =
        validCategories.length > 0
          ? {
              $in: validCategories.map((id) => new mongoose.Types.ObjectId(id)),
            }
          : undefined;
      if (!filter.categories) delete filter.categories;
    }

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = await this.blogsModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.blogsModel
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

  async findOne(id: string) {
    await isValidObjectId(id);
    return await this.blogsModel.findById(id).populate([
      { path: 'author', select: 'fullname' },
      { path: 'tags', select: 'name' },
      { path: 'categories', select: 'name' },
    ]);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, user: IUser) {
    await isExistObject(
      this.blogsModel,
      { _id: id },
      { checkNotDeleted: false, errorMessage: 'Blog không tồn tại' },
    );
    return await this.blogsModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateBlogDto,
        slug:
          updateBlogDto.slug?.length > 0
            ? updateBlogDto.slug
            : convertSlugUrl(updateBlogDto.title),
        updatedBy: getUserMetadata(user),
      },
      { new: true, runValidators: true },
    );
  }

  async remove(id: string, user: IUser) {
    await isValidObjectId(id);
    await this.blogsModel.updateOne(
      { _id: id },
      { deletedBy: getUserMetadata(user) },
    );
    return await this.blogsModel.delete({ _id: id });
  }
}

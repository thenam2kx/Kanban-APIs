import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import {
  getUserMetadata,
  isExistObject,
  isValidObjectId,
} from 'src/utils/utils';
import aqp from 'api-query-params';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name)
    private readonly tagModel: SoftDeleteModel<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto, user: IUser) {
    const isExitedTag = await this.tagModel.findOne({
      name: createTagDto.name,
    });
    if (isExitedTag) {
      throw new BadRequestException('Tag đã tồn tại.');
    }

    return await this.tagModel.create({
      ...createTagDto,
      createdBy: getUserMetadata(user),
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = await this.tagModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.tagModel
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
    return await this.tagModel.findById(id).populate('createdBy');
  }

  async update(id: string, updateTagDto: UpdateTagDto, user: IUser) {
    await isExistObject(
      this.tagModel,
      { _id: id },
      { checkNotDeleted: false, errorMessage: 'Tag không tồn tại' },
    );
    return await this.tagModel.findByIdAndUpdate(
      { _id: id },
      { ...updateTagDto, updatedBy: getUserMetadata(user) },
      { new: true, runValidators: true },
    );
  }

  async remove(id: string, user: IUser) {
    await isValidObjectId(id);
    await this.tagModel.updateOne(
      { _id: id },
      { deletedBy: getUserMetadata(user) },
    );
    return await this.tagModel.delete({ _id: id });
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ResponseMessage('Tạo tags thành công')
  create(@Body() createTagDto: CreateTagDto, @User() user: IUser) {
    return this.tagsService.create(createTagDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách tags thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.tagsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy tags thành công')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật tags thành công')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @User() user: IUser,
  ) {
    return this.tagsService.update(id, updateTagDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa tags thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.tagsService.remove(id, user);
  }
}

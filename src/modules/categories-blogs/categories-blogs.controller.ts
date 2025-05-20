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
import { CategoriesBlogsService } from './categories-blogs.service';
import { CreateCategoriesBlogDto } from './dto/create-categories-blog.dto';
import { UpdateCategoriesBlogDto, UpdateStatusCategoriesBlogDto } from './dto/update-categories-blog.dto';
import { IUser } from '../users/users.interface';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('categories-blogs')
export class CategoriesBlogsController {
  constructor(
    private readonly categoriesBlogsService: CategoriesBlogsService,
  ) {}

  @Post()
  @ResponseMessage('Tạo danh mục thành công!')
  create(
    @Body() createCategoriesBlogDto: CreateCategoriesBlogDto,
    @User() user: IUser,
  ) {
    return this.categoriesBlogsService.create(createCategoriesBlogDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách danh mục thành công!')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.categoriesBlogsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin danh mục thành công!')
  findOne(@Param('id') id: string) {
    return this.categoriesBlogsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin danh mục thành công!')
  update(
    @Param('id') id: string,
    @Body() updateCategoriesBlogDto: UpdateCategoriesBlogDto,
    @User() user: IUser,
  ) {
    return this.categoriesBlogsService.update(
      id,
      updateCategoriesBlogDto,
      user,
    );
  }

  @Patch(':id/status')
  @ResponseMessage('Cập nhật thông tin danh mục thành công!')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusCategoriesBlogDto: UpdateStatusCategoriesBlogDto,
    @User() user: IUser,
  ) {
    return this.categoriesBlogsService.updateStatus(
      id,
      updateStatusCategoriesBlogDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Xóa danh mục thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoriesBlogsService.remove(id, user);
  }
}

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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ResponseMessage('Tạo danh mục thành công!')
  create(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách danh mục thành công!')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.categoriesService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Lấy thông tin danh mục thành công!')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin danh mục thành công!')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: IUser,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa danh mục thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoriesService.remove(id, user);
  }
}

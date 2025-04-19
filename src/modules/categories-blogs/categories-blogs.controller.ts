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
import { UpdateCategoriesBlogDto } from './dto/update-categories-blog.dto';
import { IUser } from '../users/users.interface';
import { User } from 'src/decorator/customize';

@Controller('categories-blogs')
export class CategoriesBlogsController {
  constructor(
    private readonly categoriesBlogsService: CategoriesBlogsService,
  ) {}

  @Post()
  create(
    @Body() createCategoriesBlogDto: CreateCategoriesBlogDto,
    @User() user: IUser,
  ) {
    return this.categoriesBlogsService.create(createCategoriesBlogDto, user);
  }

  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.categoriesBlogsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesBlogsService.findOne(id);
  }

  @Patch(':id')
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

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoriesBlogsService.remove(id, user);
  }
}

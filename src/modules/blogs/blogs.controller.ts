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
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { IUser } from '../users/users.interface';
import { User } from 'src/decorator/customize';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @User() user: IUser) {
    return this.blogsService.create(createBlogDto, user);
  }

  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.blogsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @User() user: IUser,
  ) {
    return this.blogsService.update(id, updateBlogDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.blogsService.remove(id, user);
  }
}

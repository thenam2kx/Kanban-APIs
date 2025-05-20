import { Module } from '@nestjs/common';
import { CategoriesBlogsService } from './categories-blogs.service';
import { CategoriesBlogsController } from './categories-blogs.controller';
import {
  CategoriesBlog,
  CategoriesBlogSchema,
} from './schemas/categories-blog.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoriesBlog.name, schema: CategoriesBlogSchema },
    ]),
  ],
  controllers: [CategoriesBlogsController],
  providers: [CategoriesBlogsService],
})
export class CategoriesBlogsModule {}

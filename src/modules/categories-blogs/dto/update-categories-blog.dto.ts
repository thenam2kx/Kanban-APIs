import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesBlogDto } from './create-categories-blog.dto';

export class UpdateCategoriesBlogDto extends PartialType(
  CreateCategoriesBlogDto,
) {}

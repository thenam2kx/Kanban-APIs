import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesBlogDto } from './create-categories-blog.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateCategoriesBlogDto extends PartialType(
  CreateCategoriesBlogDto,
) {}

export class UpdateStatusCategoriesBlogDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsBoolean({ message: 'Trạng thái có giá trị true hoặc false' })
  isPublic: boolean;
}
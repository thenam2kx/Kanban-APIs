import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @Length(3, 50, { message: 'Danh mục phải từ 3 đến 50 ký tự' })
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái có giá trị true hoặc false' })
  isPublished: boolean;

  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'Mỗi danh mục cha phải có định dạng object-id',
  })
  @IsArray({ message: 'Danh mục cha phải có định dạng là array' })
  parent: mongoose.Schema.Types.ObjectId[];
}

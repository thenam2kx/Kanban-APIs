import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  @IsString({ message: 'Danh mục phải là chuỗi' })
  @Length(3, 50, { message: 'Danh mục phải từ 3 đến 50 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi' })
  description: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái có giá trị true hoặc false' })
  isPublic: boolean;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi' })
  image: string;

  @IsOptional()
  @IsMongoId({
    each: true,
    message: 'Mỗi danh mục cha phải có định dạng object-id',
  })
  @IsArray({ message: 'Danh mục cha phải có định dạng là array' })
  parent: mongoose.Schema.Types.ObjectId[];
}

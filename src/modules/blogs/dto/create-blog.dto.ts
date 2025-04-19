import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Tên blogs không được để trống' })
  @IsString({ message: 'Tên blogs phải là chuỗi' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi' })
  slug: string;

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  excerpt: string;

  @IsNotEmpty({ message: 'Hình ảnh không được để trống' })
  @IsString({ message: 'Hình ảnh phải là chuỗi' })
  coverImage: string;

  @IsOptional()
  @IsMongoId({ each: true, message: 'Tags không hợp lệ' })
  @IsArray({ message: 'Tags phải là mảng' })
  tags: string[];

  // @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  @IsOptional()
  isPublic: boolean;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Số lượt xem không hợp lệ' },
  )
  views: number;
}

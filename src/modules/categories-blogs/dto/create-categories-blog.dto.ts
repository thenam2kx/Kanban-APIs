import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoriesBlogDto {
  @IsString({ message: 'Tên danh mục phải là chuỗi!' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống!' })
  name: string;

  @IsString({ message: 'Slug danh mục phải là chuỗi!' })
  @IsOptional()
  slug: string;

  @IsString({ message: 'Mô tả danh mục phải là chuỗi!' })
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString({ message: 'Avatar danh mục phải là chuỗi!' })
  avatar: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic phải là boolean!' })
  isPublic: boolean;
}

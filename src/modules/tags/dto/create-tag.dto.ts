import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'Tên tags không được để trống' })
  @IsString({ message: 'Tên tags phải là chuỗi' })
  name: string; // Tag name

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Mô tả tags phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Màu sắc tags phải là chuỗi' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Icon tags phải là chuỗi' })
  icon?: string;

  @IsBoolean({ message: 'isPublic phải là boolean' })
  @IsNotEmpty({ message: 'isPublic không được để trống' })
  isPublic: boolean;
}

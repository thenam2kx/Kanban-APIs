import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty({ message: 'Trọng lượng sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Trọng lượng sản phẩm phải là số' })
  @Min(0, { message: 'Trọng lượng sản phẩm phải lớn hơn hoặc bằng 0' })
  weight: number;

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0' })
  price: number;

  @IsNotEmpty({ message: 'Số lượng sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là số' })
  @Min(0, { message: 'Số lượng sản phẩm phải lớn hơn hoặc bằng 0' })
  stock: number;

  @IsOptional()
  @IsArray({ message: 'Hình ảnh phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi đường dẫn hình ảnh phải là chuỗi' })
  images: string[];
}

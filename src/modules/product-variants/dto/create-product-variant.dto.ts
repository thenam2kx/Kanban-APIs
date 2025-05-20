import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsNotEmpty({ message: 'Id sản phẩm không được để trống!' })
  @IsString({ message: 'Id sản phẩm phải là chuỗi!' })
  @IsMongoId({ message: 'Id sản phẩm không hợp lệ!' })
  productId: string;

  @IsNotEmpty({ message: 'Tên biến thể không được để trống!' })
  @IsString({ message: 'Tên biến thể phải là chuỗi!' })
  name: string;

  @IsNotEmpty({ message: 'Cân nặng không được để trống!' })
  @IsNumber({}, { message: 'Cân nặng phải là số nguyên!' })
  weight: number;

  @IsNotEmpty({ message: 'Giá không được để trống!' })
  @IsNumber({}, { message: 'Giá phải là số nguyên!' })
  @Min(0, { message: 'Giá không được nhỏ hơn 0!' })
  price: number;

  @IsNotEmpty({ message: 'Số lượng không được để trống!' })
  @IsNumber({}, { message: 'Số lượng phải là số nguyên!' })
  @Min(0, { message: 'Số lượng không được nhỏ hơn 0!' })
  stock: number;

  @IsString({ message: 'Url ảnh phải là chuỗi!' })
  @IsOptional()
  imageUrl?: string;
}

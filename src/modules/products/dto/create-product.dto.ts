import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { CreateProductVariantDto } from 'src/modules/product-variants/dto/create-product-variant.dto';

export enum EUnitMethod {
  KG = 'KG',
  CON = 'CON',
  HOP = 'HỘP',
}

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  name: string;

  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  description: string;

  @IsArray({ message: 'Hình ảnh phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi đường dẫn hình ảnh phải là chuỗi' })
  images: string[];

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'Giá sản phẩm phải là số' },
  )
  price: number;

  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'Giá sản phẩm phải là số' },
  )
  stock: number;

  @IsOptional()
  @IsEnum(EUnitMethod, { message: 'Đơn vị sản phẩm không hợp lệ' })
  unit: string;

  @IsOptional()
  @IsMongoId({ each: true, message: 'Danh mục phải có định dạng object-id' })
  category: mongoose.Schema.Types.ObjectId;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateVariantDto)
  // variants: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái sản phẩm phải là true hoặc false' })
  isAvailable: boolean;

  @IsOptional()
  @IsDate({ message: 'Ngày hết hạn phải là ngày hợp lệ' })
  dateManufacture: Date;

  @IsOptional()
  @IsDate({ message: 'Ngày hết hạn phải là ngày hợp lệ' })
  expiryDate: Date;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { CreateVariantDto } from './create-variant.dto';

export enum EUnitMethod {
  KG = 'KG',
  CON = 'CON',
  HOP = 'HỘP',
}

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  description: string;

  @IsOptional()
  @IsArray({ message: 'Hình ảnh phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi đường dẫn hình ảnh phải là chuỗi' })
  images: string[];

  @IsOptional()
  @IsDate({ message: 'Ngày hết hạn phải là ngày hợp lệ' })
  dateManufacture: Date;

  @IsOptional()
  @IsDate({ message: 'Ngày hết hạn phải là ngày hợp lệ' })
  expiryDate: Date;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @ArrayMinSize(1, { message: 'Sản phẩm cần có ít nhất một biến thể' })
  variants: CreateVariantDto[];

  @IsOptional()
  @IsEnum(EUnitMethod, { message: 'Đơn vị sản phẩm không hợp lệ' })
  unit: string;

  @IsOptional()
  @IsMongoId({ each: true, message: 'Danh mục phải có định dạng object-id' })
  category: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái sản phẩm phải là true hoặc false' })
  isAvailable: boolean;
}

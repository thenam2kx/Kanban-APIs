import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import mongoose from 'mongoose';

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
  @IsString({ message: 'Đường dẫn hình ảnh phải là chuỗi' })
  images: string[];

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Giá sản phẩm phải là số' })
  @Min(0, { message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0' })
  price: number;

  @IsNotEmpty({ message: 'Số lượng sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là số' })
  @Min(0, { message: 'Số lượng sản phẩm phải lớn hơn hoặc bằng 0' })
  stock: number;

  @IsNotEmpty({ message: 'Ngày hết hạn sản phẩm không được để trống' })
  @IsDate({ message: 'Ngày hết hạn sản phẩm phải có định dạng ngày' })
  @Type(() => Date)
  expiryDate: Date;

  @IsNotEmpty({ message: 'Trọng lượng sản phẩm không được để trống' })
  @IsNumber({}, { message: 'Trọng lượng sản phẩm phải là số' })
  @Min(0, { message: 'Trọng lượng sản phẩm phải lớn hơn hoặc bằng 0' })
  weight: number;

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

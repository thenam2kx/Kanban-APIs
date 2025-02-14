import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';

export enum EPermissionsMethod {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
}

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  @IsString({ message: 'Tên vai trò phải là chuỗi' })
  @IsEnum(EPermissionsMethod, { message: 'Tên vai trò không hợp lệ' })
  name: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description: string;

  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsBoolean({ message: 'Trạng thái có giá trị boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsMongoId({ each: true, message: 'Mỗi vai trò phải có định dạng object-id' })
  @IsArray({ message: 'Vai trò có định dạng là array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}

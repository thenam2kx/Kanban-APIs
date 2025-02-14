import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum EPermissionsMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'Tên quyền hạn không được để trống' })
  @IsString({ message: 'Tên quyền hạn phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'APIPath không được để trống' })
  @IsString({ message: 'APIPath phải là chuỗi' })
  apiPath: string;

  @IsNotEmpty({ message: 'Phương thức không được để trống' })
  @IsString({ message: 'Phương thức phải là chuỗi' })
  @IsEnum(EPermissionsMethod, { message: 'Phương thức không hợp lệ' })
  method: string;

  @IsNotEmpty({ message: 'Module không được để trống' })
  @IsString({ message: 'Module phải là chuỗi' })
  module: string;
}

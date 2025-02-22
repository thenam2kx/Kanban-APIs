import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Length(3, 50, { message: 'Họ tên phải từ 3 đến 50 ký tự' })
  fullname: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^(03[2-9]|05[2689]|07[06-9]|08[1-9]|09[0-9])\d{7}$/, {
    message: 'Số điện thoại không đúng định dạng',
  })
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(6, 50, { message: 'Mật khẩu phải từ 6 đến 50 ký tự' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{9,}$/,
    {
      message:
        'Mật khẩu phải gồm ít nhất 1 chữ cái hoa, 1 ký tự đặc biệt và 1 chữ số',
    },
  )
  password: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isVerified: boolean;

  @IsOptional()
  @IsMongoId({ message: 'Vai trò không hợp lệ' })
  role: mongoose.Types.ObjectId;
}

export class UpdateRoleUSerDto {
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  roleId: string;
}

export class UpdateAvatarUSerDto {
  @IsNotEmpty({ message: 'Hình ảnh không được để trống' })
  avatar: string;
}

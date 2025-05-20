import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SignupAuthDto {
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @Length(3, 50, { message: 'Họ tên phải từ 3 đến 50 ký tự' })
  fullname: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

  // @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsOptional()
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
}

export class GoogleAuthDto {
  @IsNotEmpty({ message: 'Provider không được để trống' })
  provider: string;

  @IsNotEmpty({ message: 'ProviderId không được để trống' })
  providerId: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  username: string;
}

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Mã xác nhận không được để trống' })
  @IsString({ message: 'Mã xác nhận phải là chuỗi ký tự' })
  code: string;
}

export class VerifyCodeDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Mã xác nhận không được để trống' })
  @IsString({ message: 'Mã xác nhận phải là chuỗi ký tự' })
  code: string;
}

export class ReSendEmailDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;
}

export class ChangeForgotPasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

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
}

export class RequireChangePasswordDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email phải có định dạng @gmail.com' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Length(6, 50, { message: 'Mật khẩu mới phải từ 6 đến 50 ký tự' })
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{9,}$/,
    {
      message:
        'Mật khẩu mới phải gồm ít nhất 1 chữ cái hoa, 1 ký tự đặc biệt và 1 chữ số',
    },
  )
  newPassword: string;
}

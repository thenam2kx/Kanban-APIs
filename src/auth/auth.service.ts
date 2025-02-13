import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/modules/users/users.interface';
import { UsersService } from 'src/modules/users/users.service';
import * as ms from 'ms';
import { Response } from 'express';
import { comparePassword } from 'src/utils/compare.password';
import {
  ChangeForgotPasswordDto,
  RequireChangePasswordDto,
  ReSendEmailDto,
  SignupAuthDto,
  VerifyCodeDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';
import handleHashPassword from 'src/utils/hashPassword';
import generateCode from 'src/utils/generate.code';
import { MailerService } from '@nestjs-modules/mailer';
import checkExpiredCode from 'src/utils/expired.code';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  // Username, password are variables returned from passport library
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (user) {
      const isValid = await comparePassword(password, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  createRefreshToken(payload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(
          this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES',
          ) as ms.StringValue,
        ) / 1000,
    });
    return refreshToken;
  }

  sendEmail({ email, verifyCode, title, template }) {
    // send email
    this.mailerService.sendMail({
      to: email,
      subject: `${title} ${email}`,
      template: template,
      context: {
        name: email,
        activationCode: verifyCode,
      },
    });
  }

  // Handle Signin
  async handleGetAccount(user: IUser, response: Response) {
    const { _id, email, fullname, role, phone } = user;

    const payload = {
      sub: 'Token login',
      iss: 'From sever',
      _id,
      fullname,
      email,
      phone,
      role,
    };

    // Create new refresh_token
    const refresh_token = this.createRefreshToken(payload);

    // Clear old cookies
    response.clearCookie('refresh_token');

    // Set new refresh_token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(
        this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES',
        ) as ms.StringValue,
      ),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        email,
        phone,
        fullname,
        role,
      },
    };
  }

  // Handle Signin
  async handleSignin(user: IUser, response: Response) {
    const { _id, email, fullname, role, phone } = user;

    const payload = {
      sub: 'Token login',
      iss: 'From sever',
      _id,
      fullname,
      email,
      phone,
      role,
    };

    // Create new refresh_token
    const refresh_token = this.createRefreshToken(payload);

    // Clear old cookies
    response.clearCookie('refresh_token');

    // Set new refresh_token as cookies
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(
        this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES',
        ) as ms.StringValue,
      ),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        email,
        phone,
        fullname,
        role,
      },
    };
  }

  // Handle Signup
  async handleSignup(signupAuthDto: SignupAuthDto) {
    const { password, email, phone, fullname } = signupAuthDto;

    const isValidUser = await this.userModel.findOne({ email });
    if (isValidUser) {
      throw new BadRequestException(
        'Tài khoản đã tồn tại! Vui lòng đăng nhập.',
      );
    }
    const codeExpiresConfig =
      this.configService.get<string>('CODE_EXPIRES') || '5m';
    const codeExpires = new Date(
      Date.now() + ms(codeExpiresConfig as ms.StringValue),
    );

    const hashPassword = await handleHashPassword(password);
    const result = await this.userModel.create({
      verificationCode: generateCode(),
      expiredVerificationCode: codeExpires,
      password: hashPassword,
      fullname: fullname,
      email: email,
      phone: phone,
      role: 'USER',
    });
    const resultWithoutPassword = result.toObject();
    delete resultWithoutPassword.password;

    // send email
    this.mailerService.sendMail({
      to: result.email,
      subject: `Kích hoạt tài khoản ${result.email}`,
      template: 'signup',
      context: {
        name: result.fullname ?? result.email,
        activationCode: result.verificationCode,
      },
    });

    return resultWithoutPassword;
  }

  // Verify Email
  async handleVerifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    if (user.isVerified === true) {
      throw new BadRequestException(
        'Tài khoản đã được kích hoạt. Vui lòng đăng nhập!',
      );
    }

    if (checkExpiredCode(user.expiredVerificationCode.toString())) {
      if (user.verificationCode === code) {
        await this.userModel.updateOne({ email: email }, { isVerified: true });
      } else {
        throw new BadRequestException(
          'Mã kích hoạt không đúng. Vui lòng thử lại!',
        );
      }
    } else {
      throw new BadRequestException(
        'Mã kích hoạt đã hết hạn. Vui lòng gửi lại mã!',
      );
    }

    return 'Xác nhận email thành công.';
  }

  // Resend Email
  async handleReSendEmail(reSendEmailDto: ReSendEmailDto) {
    const { email } = reSendEmailDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const codeExpiresConfig =
      this.configService.get<string>('CODE_EXPIRES') || '5m';
    const codeExpires = new Date(
      Date.now() + ms(codeExpiresConfig as ms.StringValue),
    );

    const verifyCode = generateCode();
    const result = await this.userModel.updateOne(
      { email: email },
      {
        verificationCode: verifyCode,
        expiredResetPasswordCode: codeExpires,
      },
    );

    // send email
    this.mailerService.sendMail({
      to: email,
      subject: `Kích hoạt tài khoản ${email}`,
      template: 'signup',
      context: {
        name: email,
        activationCode: verifyCode,
      },
    });

    return result;
  }

  // Resend Email
  async handleRequireForgotPassword(reSendEmailDto: ReSendEmailDto) {
    const { email } = reSendEmailDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const codeExpiresConfig =
      this.configService.get<string>('CODE_EXPIRES') || '5m';
    const codeExpires = new Date(
      Date.now() + ms(codeExpiresConfig as ms.StringValue),
    );

    const verifyCode = generateCode();
    const result = await this.userModel.updateOne(
      { email: email },
      {
        resetPasswordCode: verifyCode,
        resetPasswordDate: codeExpires,
      },
    );

    // send email
    this.sendEmail({
      email,
      verifyCode,
      title: 'Xác nhận quên mật khẩu',
      template: 'forgot-password',
    });

    return result;
  }

  async handleVerifyForgotPassword(verifyCodeDto: VerifyCodeDto) {
    const { email, code } = verifyCodeDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    if (checkExpiredCode(user.resetPasswordDate.toString())) {
      if (user.resetPasswordCode === code) {
        await this.userModel.updateOne(
          { email: email },
          { resetPasswordDate: Date.now() },
        );
        return 'Xác nhận mã code thành công.';
      } else {
        throw new BadRequestException(
          'Mã kích hoạt không đúng. Vui lòng thử lại!',
        );
      }
    } else {
      throw new BadRequestException(
        'Mã kích hoạt đã hết hạn. Vui lòng gửi lại mã!',
      );
    }
  }

  async handleChangeForgotPassword(
    changeForgotPasswordDto: ChangeForgotPasswordDto,
  ) {
    const { email, password } = changeForgotPasswordDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const hashPassword = await handleHashPassword(password);
    await this.userModel.updateOne(
      { email: email },
      { password: hashPassword },
    );

    return 'Thay đổi mật khẩu thành công.';
  }

  async handleRequireChangePassword(
    requireChangePasswordDto: RequireChangePasswordDto,
  ) {
    const { currentPassword, newPassword, email } = requireChangePasswordDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại.');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }

    const hashPassword = await handleHashPassword(newPassword);
    await this.userModel.updateOne(
      { email: email },
      {
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        password: hashPassword,
      },
    );

    return 'Thay đổi mật khẩu thành công.';
  }
}

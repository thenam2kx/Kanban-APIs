import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Public,
  ResponseMessage,
  SkipCheckPermission,
  User,
} from 'src/decorator/customize';
import { LocalAuthGuard } from './passport/local-passport/local-auth.guard';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ChangeForgotPasswordDto,
  RequireChangePasswordDto,
  ReSendEmailDto,
  SignupAuthDto,
  VerifyCodeDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { IUser } from 'src/modules/users/users.interface';
import { GoogleOauthGuard } from './passport/google-passport/google-oauth.guard';
import { DeviceInfo } from './auth.interface';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('account')
  @ResponseMessage('Lấy thông tin tài khoản thành công.')
  handleGetAccount(@User() user: IUser) {
    return user;
  }

  @Public()
  @Post('signin')
  @ResponseMessage('Đăng nhập thành công.')
  @UseGuards(LocalAuthGuard)
  handleSignin(@Req() req, @Res({ passthrough: true }) response: Response) {
    const device: DeviceInfo = (req as any).deviceInfo;
    console.log('🚀 ~ AuthController ~ handleSignin ~ device:', device);
    return this.authService.handleSignin(req.user, response, device);
  }

  @Post('signout')
  @ResponseMessage('Đăng xuất thành công.')
  handleSignout(@Res() response: Response, @User() user: IUser) {
    return this.authService.handleSignout(user, response);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ResponseMessage('Chuyển hướng đến Google để đăng nhập.')
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @ResponseMessage('Đăng nhập thành công với Google.')
  @UseGuards(GoogleOauthGuard)
  googleAuthRedirect(@Req() req) {
    const googleAuthDto = req.user;
    return this.authService.handleGoogleSignin(googleAuthDto);
  }

  @Public()
  @Post('signup')
  @ResponseMessage('Đăng ký thành công.')
  handleSignup(@Body() signupAuthDto: SignupAuthDto) {
    return this.authService.handleSignup(signupAuthDto);
  }

  @Public()
  @Get('refresh-token')
  @SkipCheckPermission()
  @ResponseMessage('Lấy refresh-token thành công.')
  handleRefreshToken(@Req() request, @Res({ passthrough: true }) response) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.handleRefreshToken(refresh_token, response);
  }

  @Public()
  @Post('verify-email')
  @ResponseMessage('Xác nhận email thành công.')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.handleVerifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('resend-email')
  @ResponseMessage('Gửi email thành công.')
  reSendEmail(@Body() reSendEmailDto: ReSendEmailDto) {
    return this.authService.handleReSendEmail(reSendEmailDto);
  }

  @Public()
  @Post('forgot-password')
  @ResponseMessage('Gửi email thành công.')
  forgotPassword(@Body() reSendEmailDto: ReSendEmailDto) {
    return this.authService.handleRequireForgotPassword(reSendEmailDto);
  }

  @Public()
  @Post('verify-forgot-password')
  @ResponseMessage('Xác nhận mã code thành công.')
  verifyForgotPassword(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.handleVerifyForgotPassword(verifyCodeDto);
  }

  @Public()
  @Post('change-forgot-password')
  @ResponseMessage('Thay đổi mật khẩu thành công.')
  changeForgotPassword(
    @Body() changeForgotPasswordDto: ChangeForgotPasswordDto,
  ) {
    return this.authService.handleChangeForgotPassword(changeForgotPasswordDto);
  }

  @Post('require-change-password')
  @ResponseMessage('Thay đổi mật khẩu thành công.')
  handleChangePassword(
    @Body() requireChangePasswordDto: RequireChangePasswordDto,
  ) {
    return this.authService.handleRequireChangePassword(
      requireChangePasswordDto,
    );
  }
}

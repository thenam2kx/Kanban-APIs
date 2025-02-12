import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './passport/local-passport/local-auth.guard';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  @ResponseMessage('Đăng nhập thành công.')
  @UseGuards(LocalAuthGuard)
  handleSignin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.handleSignin(req.user, response);
  }

  @Public()
  @Post('signup')
  @ResponseMessage('Đăng ký thành công.')
  handleRegister(@Body() createAuthDto: any) {
    return this.authService.handleSignup(createAuthDto);
  }
}

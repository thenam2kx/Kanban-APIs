import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (password === '')
      throw new UnauthorizedException('Mật khẩu không được để trống!');

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new BadRequestException('Email hoặc mật khẩu Không tồn tại!');
    }
    if (user.isVerified === false) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt!');
    }
    return user;
  }
}

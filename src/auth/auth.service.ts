import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/modules/users/users.interface';
import { UsersService } from 'src/modules/users/users.service';
import * as ms from 'ms';
import { Response } from 'express';
import { comparePassword } from 'src/utils/compare.password';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  handleSignup(createAuthDto) {}
}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './passport/local-passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as ms from 'ms';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/users/schemas/user.schema';
import { RolesModule } from 'src/modules/roles/roles.module';
import { Role, RoleSchema } from 'src/modules/roles/schemas/role.schema';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn:
            ms(
              configService.get<string>(
                'JWT_ACCESS_TOKEN_EXPIRES',
              ) as ms.StringValue,
            ) / 1000,
        },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}

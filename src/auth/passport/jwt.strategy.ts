import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/modules/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { Role, RoleDocument } from 'src/modules/roles/schemas/role.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  // The validate() method is called whenever a user is authenticated. The method receives the payload from the JWT token and returns the user.
  async validate(payload: IUser) {
    const { _id, fullname, email, role, phone } = payload;

    // Get role from user
    const userRole = role as unknown as { _id: string; name: string };
    const temp = await this.roleModel.findOne({ _id: userRole }).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });

    // Return the user object
    return {
      _id,
      fullname,
      email,
      phone,
      role,
      permissions: temp?.permissions ?? [],
    };
  }
}

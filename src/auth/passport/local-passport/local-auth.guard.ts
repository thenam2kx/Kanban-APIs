import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// The LocalAuthGuard class is a custom guard that extends the AuthGuard class from the @nestjs/passport package.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

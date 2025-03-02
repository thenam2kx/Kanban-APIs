import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { CustomThrottlerFilter } from './core/ThrottlerException';
import { TransformInterceptor } from './core/transform.interceptor';
import { JwtAuthGuard } from './auth/passport/jwt-passport/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Get the ConfigService instance
  const configService = app.get(ConfigService);

  // Config cookies
  app.use(cookieParser());

  // Config global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Config global AuthGuard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // Config global Interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Config CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Config version api
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  /**
   * Helmet is a middleware that enhances the security of the web application
   * by setting appropriate HTTP headers. It helps protect against common
   * security vulnerabilities such as:
   * - Cross-Site Scripting (XSS)
   * - Clickjacking
   * - Sniffing attacks
   * - Exposing sensitive server information via HTTP headers
   */
  app.use(helmet());

  // Apply the custom throttler filter globally
  app.useGlobalFilters(new CustomThrottlerFilter());

  // Config view engine
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(configService.get<string>('APP_PORT') ?? 8080);
}
bootstrap();

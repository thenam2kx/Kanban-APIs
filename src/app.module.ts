import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import * as MongooseDelete from 'mongoose-delete';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { FilesModule } from './modules/files/files.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TagsModule } from './modules/tags/tags.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { CategoriesBlogsModule } from './modules/categories-blogs/categories-blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),

    /**
     *  Throttler is a middleware that implements rate limiting for the application.
     *  It helps prevent abuse or overloading of the API by:
     * - Limiting the number of requests a client can make within a given time frame.
     * - Protecting against denial-of-service (DoS) attacks and brute force attempts.
     * - Enhancing the application's overall stability and security.
     */
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Config Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        // Config MongooseDelete
        connectionFactory: (connection) => {
          connection.plugin(MongooseDelete, {
            deletedAt: true,
            overrideMethods: 'all',
            indexFields: true,
          });
          return connection;
        },
      }),
    }),

    // Config Mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.get<string>('EMAIL_AUTH_USER'),
            pass: configService.get<string>('EMAIL_AUTH_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    AuthModule,
    FilesModule,
    RolesModule,
    PermissionsModule,
    ProductsModule,
    ProductVariantsModule,
    CategoriesModule,
    OrdersModule,
    OrderItemsModule,
    PaymentsModule,
    BlogsModule,
    CategoriesBlogsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

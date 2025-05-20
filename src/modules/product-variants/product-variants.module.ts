import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductVariant,
  ProductVariantSchema,
} from './schemas/product-variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}

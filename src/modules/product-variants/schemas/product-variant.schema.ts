import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class ProductVariant {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Number })
  weight: number;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, type: Number })
  stock: number;

  @Prop({ type: String, default: null })
  imageUrl: string;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
}

export type ProductVariantDocument = HydratedDocument<ProductVariant>;
export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

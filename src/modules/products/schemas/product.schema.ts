import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/modules/categories/schemas/category.schema';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Variant {
  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ default: [] })
  images: string[];
}

const VariantSchema = SchemaFactory.createForClass(Variant);

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: [] })
  images: string[];

  @Prop()
  dateManufacture: Date;

  @Prop()
  expiryDate: Date;

  @Prop({ type: [VariantSchema], default: [] })
  variants: Types.Array<Variant>;

  @Prop({
    enum: ['KG', 'CON', 'HỘP'],
    default: 'KG',
  })
  unit: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
  category: mongoose.Schema.Types.ObjectId;

  @Prop({ default: true })
  isAvailable: boolean;

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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

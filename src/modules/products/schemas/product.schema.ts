import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/modules/categories/schemas/category.schema';

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

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({
    enum: ['KG', 'CON', 'HỘP'],
    default: 'KG',
  })
  unit: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
  category: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' }],
    default: [],
    required: false,
  })
  variants?: Types.Array<mongoose.Schema.Types.ObjectId>;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop()
  dateManufacture: Date;

  @Prop()
  expiryDate: Date;

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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class CategoriesBlog {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: false })
  description: string;

  @Prop()
  avatar: string;

  @Prop({ default: true })
  isPublic: boolean;

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

export type CategoriesBlogDocument = HydratedDocument<CategoriesBlog>;
export const CategoriesBlogSchema =
  SchemaFactory.createForClass(CategoriesBlog);

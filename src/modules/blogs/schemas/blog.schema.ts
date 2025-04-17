import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Tag } from 'src/modules/tags/schemas/tag.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop()
  featuredImage: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Tag.name })
  tags: Tag[];

  @Prop({ default: 'draft', enum: ['draft', 'published'] })
  isPublished: string; // draft, published

  @Prop({ default: 0 })
  views: number;
}

export type BlogDocument = HydratedDocument<Blog>;
export const BlogSchema = SchemaFactory.createForClass(Blog);

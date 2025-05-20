import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Tag {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: '' })
  slug: string;

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

export type TagDocument = HydratedDocument<Tag>;
export const TagSchema = SchemaFactory.createForClass(Tag);

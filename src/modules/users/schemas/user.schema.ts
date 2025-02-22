import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/modules/roles/schemas/role.schema';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  avatar: string;

  @Prop({ enum: ['MALE', 'FEMALE'], default: 'MALE' })
  gender: string;

  @Prop()
  birthday: Date;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      country: String,
    },
    default: null,
  })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationCode: string;

  @Prop()
  expiredVerificationCode: Date;

  @Prop()
  resetPasswordCode: string;

  @Prop()
  expiredResetPasswordCode: string;

  @Prop()
  resetPasswordDate: Date;

  @Prop()
  refresh_token: string;

  @Prop({ enum: ['SYSTEM', 'GOOGLE', 'FACEBOOK'], default: 'SYSTEM' })
  type: string;

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

  @Prop({ default: false })
  blocked: boolean;

  @Prop()
  blockedAt: Date;

  @Prop({ type: Object })
  blockedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

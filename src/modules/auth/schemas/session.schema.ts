import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { Device } from './device.schema';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Session {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Device.name })
  deviceId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop()
  expireTime: Date;

  @Prop()
  loginTime: Date;

  @Prop({ default: false })
  revoked: boolean;
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);

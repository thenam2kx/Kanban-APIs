import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Device {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  deviceType: string;

  @Prop({ required: true })
  os: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  browser: string;

  @Prop()
  lastLogin: Date;
}

export type DeviceDocument = HydratedDocument<Device>;
export const DeviceSchema = SchemaFactory.createForClass(Device);

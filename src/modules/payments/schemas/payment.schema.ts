import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Payment {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  orderId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  paymentUrl: string;

  @Prop({
    default: 'PENDING',
    enum: ['PENDING', 'FULFILLED', 'REJECTED'],
  })
  status: string;

  @Prop()
  transactionId: string;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

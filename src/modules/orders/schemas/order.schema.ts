import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export enum PaymentMethod {
  COD = 'COD',
  VNPAY = 'VNPAY',
  MOMO = 'MOMO',
  PAYPAL = 'PAYPAL',
  ZALOPAY = 'ZALOPAY',
}

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, match: /^[0-9]{9,11}$/ })
  phone: string;

  @Prop({
    type: {
      specific: String,
      street: String,
      city: String,
      _id: false,
    },
    required: true,
  })
  address: {
    specific: string;
    street: string;
    city: string;
  };
}

@Schema({ timestamps: true, versionKey: false, strict: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    default: [],
    required: false,
  })
  items: Types.Array<mongoose.Schema.Types.ObjectId>;

  @Prop({ type: ShippingAddress, required: true, _id: false })
  shippingAddress: ShippingAddress;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ required: true })
  totalPrice: number;

  @Prop()
  discount: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  @IsDate({ message: 'Ngày thanh toán không hợp lệ' })
  paidAt?: Date;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop()
  deliveredAt: Date;

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

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

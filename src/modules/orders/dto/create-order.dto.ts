import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

export class OrderItemDto {
  @IsNotEmpty({ message: 'Id sản phẩm không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Id sản phẩm phải có định dạng object-id',
  })
  productId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Id biến thể không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Id biến thể phải có định dạng object-id',
  })
  variantId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'Giá sản phẩm phải là số' },
  )
  price: number;

  @IsNotEmpty({ message: 'Số lượng phẩm không được để trống' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'Số lượng phẩm phải là số' },
  )
  quantity: number;

  @IsNotEmpty({ message: 'Ảnh sản phẩm không được để trống' })
  @IsString({ message: 'Ảnh sản phẩm phải là chuỗi' })
  imageUrl: string;
}

class AddressDto {
  @IsString({ message: 'Địa chỉ cụ thể phải là chuỗi' })
  @IsNotEmpty({ message: 'Địa chỉ cụ thể không được để trống' })
  specific: string;

  @IsString({ message: 'Tên đường phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đường không được để trống' })
  street: string;

  @IsString({ message: 'Thành phố phải là chuỗi' })
  @IsNotEmpty({ message: 'Thành phố không được để trống' })
  city: string;

  @IsString({ message: 'Quốc gia phải là chuỗi' })
  @IsNotEmpty({ message: 'Quốc gia không được để trống' })
  country: string;
}

export class ShippingAddressDto {
  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  fullName: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^(03[2-9]|05[2689]|07[06-9]|08[1-9]|09[0-9])\d{7}$/, {
    message: 'Số điện thoại không đúng định dạng',
  })
  phone: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested({ message: 'Địa chỉ không hợp lệ' })
  @Type(() => AddressDto)
  address: {
    specific: string;
    street: string;
    city: string;
    country: string;
  };
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Id người dùng không được để trống' })
  @IsMongoId({
    each: true,
    message: 'Id người dùng phải có định dạng object-id',
  })
  userId: mongoose.Schema.Types.ObjectId;

  @IsArray()
  @IsNotEmpty({ message: 'Đơn đặt hàng phải có ít nhất một sản phẩm.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1, { message: 'Đơn đặt hàng phải có ít nhất một sản phẩm.' })
  items: OrderItemDto[];

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested({ message: 'Địa chỉ không hợp lệ' })
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsNotEmpty({ message: 'Trạng thái đơn hàng không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'Tổng giá trị đơn hàng không được để trống' })
  totalPrice: Date;

  @IsOptional()
  discount: number;

  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  paymentMethod: string;

  @IsOptional()
  isPaid: boolean;

  @IsOptional()
  paidAt: Date;

  @IsOptional()
  isDelivered: boolean;

  @IsOptional()
  deliveredAt: Date;
}

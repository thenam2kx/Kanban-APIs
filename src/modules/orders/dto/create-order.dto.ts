import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-order-item.dto';

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
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1, { message: 'Đơn đặt hàng phải có ít nhất một sản phẩm.' })
  items: CreateOrderItemDto[];

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested({ message: 'Địa chỉ không hợp lệ' })
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsNotEmpty({ message: 'Trạng thái đơn hàng không được để trống' })
  status: string;

  @IsNotEmpty({ message: 'Tổng giá trị đơn hàng không được để trống' })
  totalPrice: number;

  @IsOptional()
  discount: number;

  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi' })
  paymentMethod: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái thanh toán phải là boolean' })
  isPaid: boolean;

  @IsOptional()
  @IsDate({ message: 'Ngày thanh toán không hợp lệ' })
  paidAt?: Date;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái giao hàng phải là boolean' })
  isDelivered: boolean;

  @IsOptional()
  @IsDate({ message: 'Ngày giao hàng không hợp lệ' })
  deliveredAt: Date;
}

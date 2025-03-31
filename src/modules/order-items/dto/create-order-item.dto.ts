import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateOrderItemDto {
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
  @Min(0)
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

import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'ID đơn hàng không được để trống!' })
  @IsMongoId()
  orderId: string;

  @IsNotEmpty({ message: 'ID người dùng không được để trống!' })
  @IsMongoId()
  userId: string;

  @Min(0, { message: 'Số tiền không hợp lệ!' })
  @IsNotEmpty({ message: 'Số tiền không được để trống!' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Số tiền không hợp lệ!' },
  )
  amount: number;

  @IsOptional()
  paymentUrl: string;

  @IsEnum(['PENDING', 'FULFILLED', 'REJECTED'])
  @IsOptional()
  status: string;

  @IsOptional()
  @IsString({ message: 'ID giao dịch không hợp lệ!' })
  transactionId: string;
}

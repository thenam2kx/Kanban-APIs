import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: SoftDeleteModel<PaymentDocument>,
    private readonly configService: ConfigService,
  ) {}

  private formatDate(date: Date): string {
    return date
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
  }

  private createHmacSha512(data: string, secret: string): string {
    return crypto.createHmac('sha512', secret).update(data).digest('hex');
  }

  private sortObject(obj: { [key: string]: any }): { [key: string]: any } {
    return Object.keys(obj)
      .sort()
      .reduce((result: { [key: string]: any }, key: string) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  private readonly vnpayConfig = {
    vnp_TmnCode: this.configService.get<string>('VNP_TMN_CODE'),
    vnp_HashSecret: this.configService.get<string>('VNP_HASH_SECRET'),
    vnp_Url: this.configService.get<string>('VNP_URL'),
    vnp_ReturnUrl: this.configService.get<string>('VNP_RETURN_URL'),
  };

  async createPaymentVNP(createPaymentDto: CreatePaymentDto, ipAddr: string) {
    const date = new Date();
    const createDate = this.formatDate(date);

    console.log('🚀 ~ PaymentsService ~ vnpayConfig:', this.vnpayConfig);
    const vnpParams: { [key: string]: string | number } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpayConfig.vnp_TmnCode,
      vnp_Amount: createPaymentDto.amount * 100,
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${createPaymentDto.orderId}`,
      vnp_OrderType: 'billpayment',
      vnp_ReturnUrl: this.vnpayConfig.vnp_ReturnUrl,
      vnp_TxnRef: createPaymentDto.orderId,
      vnp_BankCode: 'NCB',
    };

    const sortedParams = this.sortObject(vnpParams);

    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');

    const secureHash = this.createHmacSha512(
      signData,
      this.vnpayConfig.vnp_HashSecret,
    );

    const paymentUrl = `${this.vnpayConfig.vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;

    await this.paymentModel.create({
      ...createPaymentDto,
      paymentUrl,
      transactionId: vnpParams.vnp_TxnRef,
    });

    return paymentUrl;
  }

  async handleVNPReturn(vnpParams: { [key: string]: string }) {
    const secureHash = vnpParams['vnp_SecureHash'];
    console.log(
      '🚀 ~ PaymentsService ~ handleVNPReturn ~ secureHash:',
      secureHash,
    );
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&');
    const checkSum = this.createHmacSha512(
      signData,
      this.vnpayConfig.vnp_HashSecret,
    );

    if (secureHash === checkSum) {
      const payment = await this.paymentModel.findOne({
        orderId: vnpParams['vnp_TxnRef'],
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.status =
        vnpParams['vnp_ResponseCode'] === '00' ? 'SUCCESS' : 'FAILED';
      payment.transactionId = vnpParams['vnp_TransactionNo'];
      await payment.save();

      return {
        status: payment.status,
        transactionId: payment.transactionId,
      };
    }
    throw new Error('Invalid checksum');
  }
}

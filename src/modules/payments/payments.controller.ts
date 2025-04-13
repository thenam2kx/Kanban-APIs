import { Controller, Get, Post, Body, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from 'src/decorator/customize';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('vnpay')
  postPaymentVNP(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() request,
  ) {
    const ipAddr =
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress;
    return this.paymentsService.createPaymentVNP(createPaymentDto, ipAddr);
  }

  @Public()
  @Get('vnpay-return')
  getPaymentVNPReturnUrl(@Query() query: any) {
    console.log(
      '🚀 ~ PaymentsController ~ getPaymentVNPReturnUrl ~ query:',
      query,
    );
    return this.paymentsService.handleVNPReturn(query);
  }
}

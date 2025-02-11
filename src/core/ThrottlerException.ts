import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class CustomThrottlerFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(429).json({
      statusCode: 429,
      message:
        'Bạn đã vượt quá giới hạn yêu cầu. Vui lòng đợi vài giây trước khi thử lại.',
      error: 'Rate Limit Exceeded',
    });
  }
}

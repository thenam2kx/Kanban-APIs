import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class DeviceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Lấy IP
    const ip =
      (request.headers['x-forwarded-for'] as string) ||
      request.connection.remoteAddress;

    // check IP is valid (IPv4 or IPv6)
    const isValidIp = (ip: string) => {
      const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      return (
        ipv4Regex.test(ip) ||
        ipv6Regex.test(ip) ||
        ip === '::1' ||
        ip === '127.0.0.1'
      );
    };

    // Khởi tạo đối tượng deviceInfo
    const deviceInfo: any = { ip };

    // Xử lý IP cục bộ hoặc không hợp lệ
    if (!isValidIp(ip)) {
      deviceInfo.geo = { error: 'IP không hợp lệ' };
    } else if (ip === '::1' || ip === '127.0.0.1') {
      deviceInfo.geo = { error: 'IP cục bộ không hỗ trợ GeoIP' };
    } else {
      // Tra cứu GeoIP
      const geo = geoip.lookup(ip);
      deviceInfo.geo = geo
        ? {
            country: geo.country,
            region: geo.region,
            city: geo.city,
            latitude: geo.ll[0],
            longitude: geo.ll[1],
          }
        : { error: 'Không tìm thấy thông tin GeoIP' };
    }

    // Lấy và phân tích User Agent
    const userAgentString = request.headers['user-agent'];
    if (!userAgentString) {
      deviceInfo.userAgent = { error: 'Không có User Agent' };
    } else {
      const parser = new UAParser(userAgentString);
      const uaResult = parser.getResult();
      deviceInfo.userAgent = {
        browser: uaResult.browser,
        os: uaResult.os,
        device: uaResult.device,
        engine: uaResult.engine,
        cpu: uaResult.cpu,
      };
    }

    // Gắn deviceInfo vào request
    request['deviceInfo'] = deviceInfo;

    return next.handle();
  }
}

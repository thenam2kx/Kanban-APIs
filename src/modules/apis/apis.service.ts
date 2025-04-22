import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry from 'axios-retry';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApisService {
  private readonly logger = new Logger('ApiService');

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Config axios retry
    axiosRetry(this.httpService.axiosRef, {
      retries: 3, // Số lần thử lại
      retryDelay: (retryCount) => retryCount * 1000, // Chờ 1s, 2s, 3s
      retryCondition: (error) => {
        // Chỉ retry cho lỗi 429
        return error.response?.status === 429;
      },
    });

    // Config interceptor request
    this.httpService.axiosRef.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.configService.get<string>('API_TOKEN');
        if (token) {
          config.headers = (config.headers || {}) as AxiosRequestHeaders;
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        // Xử lý lỗi khi gửi yêu cầu
        return Promise.reject(error);
      },
    );

    // Config interceptor response
    this.httpService.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.log(
          `Response from ${response.config.url}: ${response.status}`,
        );
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          this.logger.error(
            `Error ${error.response.status}: ${(error.response.data as { message?: string })?.message || 'Server error'}`,
          );
        } else if (error.request) {
          this.logger.error('No response received');
        } else {
          this.logger.error(`Error: ${error.message}`);
        }
        return Promise.reject(error);
      },
    );
  }

  async getData(endpoint: string): Promise<any> {
    try {
      const config: AxiosRequestConfig = {
        maxRedirects: 2,
      };
      const response = await firstValueFrom(
        this.httpService.get(endpoint, config),
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

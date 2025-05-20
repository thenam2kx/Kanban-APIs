import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FilesService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFileCloudinary(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            upload_preset: this.configService.get<string>(
              'CLOUDINARY_PRESET_NAME',
            ),
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async getFileCloudinary(maxResults: number = 100): Promise<any> {
    try {
      const result = await cloudinary.api.resources({
        resource_type: 'image',
        max_results: maxResults,
      });
      return result.resources.map((resource) => ({
        public_id: resource.public_id,
        url: resource.secure_url,
        created_at: resource.created_at,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch images: ${error.message}`);
    }
  }
}

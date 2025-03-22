import {
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { ResponseMessage } from 'src/decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/core/http-exception.filter';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('fileUpload'))
  @UseFilters(new HttpExceptionFilter())
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Headers('folder_type') headers,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      fileName: `${headers}/${file.filename}`,
    };
  }
}

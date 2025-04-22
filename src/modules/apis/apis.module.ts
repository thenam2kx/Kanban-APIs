import { Module } from '@nestjs/common';
import { ApisService } from './apis.service';
import { ApisController } from './apis.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ApisController],
  providers: [ApisService],
  exports: [ApisService],
})
export class ApisModule {}

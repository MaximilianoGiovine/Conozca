import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { LoggerService } from './logger.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, LoggerService],
  exports: [UploadService],
})
export class UploadModule {}

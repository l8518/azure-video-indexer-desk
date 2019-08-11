import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoInsightsModule } from './video-insights/video-insights.module';
import { VideoInsightsService } from './video-insights/video-insights.service';
import { FileUploadController } from './file-upload/file-upload.controller';
import { VideoInsightsController } from './video-insights/video-insights.controller';
import { FileUploadService } from './file-upload/file-upload.service';

@Module({
  imports: [VideoInsightsModule],
  controllers: [AppController, FileUploadController, VideoInsightsController],
  providers: [AppService, FileUploadService, VideoInsightsService],
})
export class AppModule {}

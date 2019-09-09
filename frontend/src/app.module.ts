import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoInsightsModule } from './video-insights/video-insights.module';
import { VideoInsightsService } from './video-insights/video-insights.service';
import { VideoInsightsController } from './video-insights/video-insights.controller';
import { EmailDemoController } from './email-demo/email-demo.controller';
import { AboutController } from './about/about.controller';

@Module({
  imports: [VideoInsightsModule],
  controllers: [AppController, VideoInsightsController, EmailDemoController, AboutController],
  providers: [AppService],
})
export class AppModule {}

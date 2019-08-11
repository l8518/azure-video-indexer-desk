import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoInsightsService } from './video-insights/video-insights.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly videoInsightsService: VideoInsightsService) { }

  @Get()
  @Render('index')
  async root() {

    let indexed_videos = (await this.videoInsightsService.findAll()).resources

    return {
      indexed_videos : indexed_videos
    };
  }

}

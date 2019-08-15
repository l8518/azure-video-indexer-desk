import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { VideoInsightsService } from './video-insights/video-insights.service';
import { isNullOrUndefined } from 'util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly videoInsightsService: VideoInsightsService) {

    this.appService.bootstrap_check()
   }

  @Get()
  @Render('index')
  async root() {

    let indexed_videos = (await this.videoInsightsService.findAll()).resources
    let transformedVideos = indexed_videos.map((value: any) => {
      value.labels = this.videoInsightsService.filterAndTransformForTopNSignificantInstances(value.labels)
      return value;
    })

    return {
      indexed_videos : transformedVideos,
    };
  }

}

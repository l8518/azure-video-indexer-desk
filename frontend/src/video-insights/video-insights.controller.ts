import { Controller, Get, Render, Param } from '@nestjs/common';
import { VideoInsightsService } from './video-insights.service';

@Controller('video-insights')
export class VideoInsightsController {
    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get(':id')
    @Render('video-insights/index')
    async root(@Param() params) {

        let videoId = params.id
        let selected_video = (await this.videoInsightsService.findOne(videoId)).resources[0];
        selected_video.insights.faces = this.videoInsightsService.prepareFaces(videoId, selected_video.insights.faces, false);

        return {
            selected_video: selected_video
        };
    }
}

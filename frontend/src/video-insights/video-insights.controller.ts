import { Controller, Get, Render, Param } from '@nestjs/common';
import { VideoInsightsService } from './video-insights.service';

@Controller('video-insights')
export class VideoInsightsController {
    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get(':id')
    @Render('video-insights/index')
    async root(@Param() params) {

        let videoId = params.id
        // fetch a single video, passed via the id.
        let selected_video = (await this.videoInsightsService.findOne(videoId)).resources[0];
        // prepare the JSON structures for display (like add URI)
        selected_video.insights.faces = this.videoInsightsService.prepareFaces(videoId, selected_video.insights.faces, false);
        selected_video.insights.shots = this.videoInsightsService.prepareShots(videoId, selected_video.insights.shots);

        return {
            selected_video: selected_video
        };
    }
}

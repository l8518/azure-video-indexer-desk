import { Controller, Get, Render, Param } from '@nestjs/common';
import { VideoInsightsService } from './video-insights.service';

@Controller('video-insights')
export class VideoInsightsController {
    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get(':id')
    @Render('video-insights/index')
    async root(@Param() params) {

        let resp = (await this.videoInsightsService.findOne(params.id));

        return {
            stringified: JSON.stringify(resp)
        };
    }
}

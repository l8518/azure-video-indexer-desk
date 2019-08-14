import { Controller, Get, Render, Param, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Response } from 'express';
import { VideoInsightsService } from '../video-insights/video-insights.service';
import { ResponseError } from 'superagent';

@Controller('email-demo')
export class EmailDemoController {

    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get('/:id')
    show(@Param() params, @Res() res: Response) {

        let selectedId = params.id;
        return this.renderVideo(res, selectedId);

    }

    @Get('/')
    async root(@Res() res: Response) {

        let lastId = (await this.videoInsightsService.lastId()).resources[0].id;
        return this.renderVideo(res, lastId);
    }

    private async renderVideo(res: Response, videoId : string) {
        let indexed_videos = (await this.videoInsightsService.findAll()).resources
        let transformedVideos = indexed_videos.map((value: any) => {
            value.labels = this.videoInsightsService.filterAndTransformForTopNSignificantInstances(value.labels)
            return value;
        });

        let selected_video = (await this.videoInsightsService.findOne(videoId)).resources[0];
        selected_video.insights.faces = this.videoInsightsService.prepareFaces(videoId, selected_video.insights.faces, false);

        return res.render(
            'email-demo/index',
            {
                indexed_videos: transformedVideos,
                selected_video: selected_video,
                layout: 'default_email'
            },
        );
    }

}

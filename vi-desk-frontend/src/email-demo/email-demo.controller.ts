import { Controller, Get, Render, Param, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Response } from 'express';
import { VideoInsightsService } from '../video-insights/video-insights.service';

@Controller('email-demo')
export class EmailDemoController {

    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get('/:id')
    @Render('email-demo/index')
    async show(@Param() params) {

    }

    @Get('/')
    async root(@Res() res: Response) {

        let indexed_videos = (await this.videoInsightsService.findAll()).resources
        let transformedVideos = indexed_videos.map((value: any) => {
            value.labels = this.videoInsightsService.filterAndTransformForTopNSignificantInstances(value.labels)
            return value;
        })

        return res.render(
            'email-demo/index',
            {
                indexed_videos: transformedVideos,
                layout: 'default_email'
            },
        );
    }

}

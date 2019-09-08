import { Controller, Get, Render, Param, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Response } from 'express';
import { VideoInsightsService } from '../video-insights/video-insights.service';
import { ResponseError } from 'superagent';
import { isNullOrUndefined } from 'util';

@Controller('email-demo')
export class EmailDemoController {

    constructor(private readonly videoInsightsService: VideoInsightsService) { }

    @Get('/player/:id')
    async player(@Param() params, @Res() res) {
        let videoId = params.id;
        let resp = (await this.videoInsightsService.getEmbeddedVideoPlayer(videoId))
        return res.redirect(resp.data);
    }

    @Get('/:id')
    show(@Param() params, @Res() res: Response) {

        let selectedId = params.id;
        return this.renderVideo(res, selectedId);

    }

    @Get('/')
    async root(@Res() res: Response) {

        let lastVideoQry = (await this.videoInsightsService.lastId()).resources;
        // fetch the last id, if available.
        let lastId = (!isNullOrUndefined(lastVideoQry) ? lastVideoQry[0].id : undefined);
        return this.renderVideo(res, lastId);
    }

    /**
     * Renders the Email-client as the videoId is the selected "email".
     * @param res 
     * @param videoId 
     */
    private async renderVideo(res: Response, videoId: string) {
        let indexed_videos = (await this.videoInsightsService.findAll()).resources
        // shows only the top significant labels
        let transformedVideos = indexed_videos.map((value: any) => {
            value.labels = this.videoInsightsService.filterAndTransformForTopNSignificantInstances(value.labels)
            return value;
        });

        // prepares the selected video for display (URIs etc.)
        let selected_video = (await this.videoInsightsService.findOne(videoId)).resources[0];
        if (!isNullOrUndefined(selected_video)) {
            selected_video.insights.faces = this.videoInsightsService.prepareFaces(videoId, selected_video.insights.faces, false);
            selected_video.insights.shots = this.videoInsightsService.prepareShots(videoId, selected_video.insights.shots);
        }

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

import { Test, TestingModule } from '@nestjs/testing';
import { VideoInsightsController } from './video-insights.controller';

describe('VideoInsights Controller', () => {
  let controller: VideoInsightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoInsightsController],
    }).compile();

    controller = module.get<VideoInsightsController>(VideoInsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

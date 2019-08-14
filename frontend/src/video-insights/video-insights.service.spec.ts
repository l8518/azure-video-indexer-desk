import { Test, TestingModule } from '@nestjs/testing';
import { VideoInsightsService } from './video-insights.service';

describe('VideoInsightsService', () => {
  let service: VideoInsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoInsightsService],
    }).compile();

    service = module.get<VideoInsightsService>(VideoInsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

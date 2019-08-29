import { Module, HttpModule } from '@nestjs/common';
import { VideoInsightsService } from './video-insights.service';

@Module({
    imports: [HttpModule],
    providers: [VideoInsightsService],
    exports: [VideoInsightsService]
})
export class VideoInsightsModule {}

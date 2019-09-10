import { Controller, Render, Get } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller('about')
export class AboutController {

    constructor(private readonly appService: AppService) { }

    @Get()
    @Render('about/index')
    root() {
        return {
            uploadURL: this.appService.getUploadURL()
        };
    }
    
}

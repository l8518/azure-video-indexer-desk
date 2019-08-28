import { Controller, Render, Get } from '@nestjs/common';

@Controller('about')
export class AboutController {

    @Get()
    @Render('about/index')
    root() {
        return;
    }
    
}

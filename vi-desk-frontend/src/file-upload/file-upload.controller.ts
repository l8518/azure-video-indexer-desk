import { Controller, Get, Render, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileUploadService } from './file-upload.service';

@Controller('file-upload')
export class FileUploadController {

    constructor(private readonly fileUploadService: FileUploadService) { }

    @Get()
    @Render('file-upload/index')
    root() {
        return { fileUploadURL: "http" };
    }

    @Post('new')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        console.log('upload posted');
        await this.fileUploadService.uploadToBlobStorage(file.originalname, file.buffer, file.size);
        // Todo: Response to user
        console.log('upload route finished');
        return;
    }

}

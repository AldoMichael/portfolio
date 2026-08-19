import {
  Controller,
  Delete,
  Get,
  Header,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PhotoService } from './photo.service';

@Controller('api')
export class PhotoController {
  constructor(private readonly photos: PhotoService) {}

  /** Image publique utilisée par le loader et le Hero. */
  @Get('photo')
  @Header('Cache-Control', 'public, max-age=3600')
  async serve(@Res() response: Response) {
    const photo = await this.photos.getLatest();
    if (!photo) {
      response.status(404).json({ message: 'Aucune photo de profil.' });
      return;
    }

    response.setHeader('Content-Type', photo.mime);
    response.setHeader('Content-Length', String(photo.data.length));
    response.end(photo.data);
  }

  @Put('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const saved = await this.photos.save(file);
    return { updatedAt: saved.updatedAt.getTime() };
  }

  @Delete('photo')
  @UseGuards(JwtAuthGuard)
  remove() {
    return this.photos.remove();
  }
}

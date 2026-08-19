import {
  Controller,
  Delete,
  Get,
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
  async serve(@Res() response: Response) {
    const photo = await this.photos.getLatest();
    if (!photo) {
      // Ne jamais mettre une 404 en cache CDN : après un upload, l’image
      // resterait invisible pendant toute la durée du cache.
      response.setHeader('Cache-Control', 'no-store, must-revalidate');
      response.setHeader('CDN-Cache-Control', 'no-store');
      response.status(404).json({ message: 'Aucune photo de profil.' });
      return;
    }

    response.setHeader('Content-Type', photo.mime);
    response.setHeader('Content-Length', String(photo.data.length));
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
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

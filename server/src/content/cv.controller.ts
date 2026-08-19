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
import { CvService } from './cv.service';

@Controller('api')
export class CvController {
  constructor(private readonly cvs: CvService) {}

  /** PDF uploadé depuis l’admin — jamais généré automatiquement. */
  @Get('cv')
  async serve(@Res() response: Response) {
    const cv = await this.cvs.getLatest();
    if (!cv) {
      response.setHeader('Cache-Control', 'no-store, must-revalidate');
      response.setHeader('CDN-Cache-Control', 'no-store');
      response.status(404).json({ message: 'Aucun CV.' });
      return;
    }

    const asciiName = cv.filename.replace(/[^\x20-\x7E]/g, '_');
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Length', String(cv.data.length));
    response.setHeader('Content-Disposition', `attachment; filename="${asciiName}"`);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.end(cv.data);
  }

  @Put('cv')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const saved = await this.cvs.save(file);
    return { updatedAt: saved.updatedAt.getTime(), filename: saved.filename };
  }

  @Delete('cv')
  @UseGuards(JwtAuthGuard)
  remove() {
    return this.cvs.remove();
  }
}

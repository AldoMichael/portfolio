import {
  Controller,
  Delete,
  Get,
  Param,
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
import { ContentService } from './content.service';

@Controller('api/clients')
export class ClientLogoController {
  constructor(private readonly content: ContentService) {}

  @Get(':id/logo')
  async serve(@Param('id') id: string, @Res() response: Response) {
    const client = await this.content.getClientLogo(id);
    if (!client?.logoData) {
      response.setHeader('Cache-Control', 'no-store, must-revalidate');
      response.setHeader('CDN-Cache-Control', 'no-store');
      response.status(404).json({ message: 'Aucun logo.' });
      return;
    }

    response.setHeader('Content-Type', client.logoMime || 'image/png');
    response.setHeader('Content-Length', String(client.logoData.length));
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.end(client.logoData);
  }

  @Put(':id/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 },
    }),
  )
  upload(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.content.saveClientLogo(id, file);
  }

  @Delete(':id/logo')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.content.removeClientLogo(id);
  }
}

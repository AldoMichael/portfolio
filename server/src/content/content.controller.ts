/**
 * ============================================================================
 *  CONTRÔLEUR DE CONTENU
 * ----------------------------------------------------------------------------
 *  Routes publiques (lecture) et routes d'administration (écriture, protégées
 *  par JWT). Les routes d'admin sont génériques : le nom de la ressource est
 *  un paramètre d'URL validé contre le schéma.
 * ============================================================================
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentService } from './content.service';
import { RESOURCES } from './schema';

@Controller('api')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  /* -------------------------------- Public ---------------------------------- */

  /** Payload unique consommé par le portfolio au chargement. */
  @Get('content')
  getContent() {
    return this.content.getPublicContent();
  }

  /** Décrit les ressources et leurs champs : sert à générer les formulaires. */
  @Get('schema')
  getSchema() {
    return RESOURCES;
  }

  /* ----------------------------- Administration ------------------------------ */

  @Get('admin/:resource')
  @UseGuards(JwtAuthGuard)
  list(@Param('resource') resource: string) {
    return this.content.list(resource);
  }

  @Post('admin/:resource')
  @UseGuards(JwtAuthGuard)
  create(@Param('resource') resource: string, @Body() body: unknown) {
    return this.content.create(resource, body);
  }

  /** Déclaré avant la route paramétrée `:id` pour éviter toute ambiguïté. */
  @Put('admin/:resource/reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Param('resource') resource: string, @Body() body: { ids?: unknown }) {
    return this.content.reorder(resource, body?.ids);
  }

  @Patch('admin/:resource/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('resource') resource: string, @Param('id') id: string, @Body() body: unknown) {
    return this.content.update(resource, id, body);
  }

  @Delete('admin/:resource/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('resource') resource: string, @Param('id') id: string) {
    return this.content.remove(resource, id);
  }
}

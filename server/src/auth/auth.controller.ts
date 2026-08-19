import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/** Fenêtre et seuil de la limitation des tentatives de connexion. */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

@Controller('api/auth')
export class AuthController {
  /** Compteur de tentatives par adresse IP (protection anti force brute). */
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email?: string; password?: string }, @Ip() ip: string) {
    this.assertNotThrottled(ip);

    try {
      const result = await this.auth.login(body?.email, body?.password);
      this.attempts.delete(ip);
      return result;
    } catch (error) {
      this.registerFailure(ip);
      throw error;
    }
  }

  /** Permet à l'admin de vérifier que son jeton est toujours valide. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request) {
    return { email: (request as any).user?.email };
  }

  private assertNotThrottled(ip: string) {
    const entry = this.attempts.get(ip);
    if (!entry) return;

    if (Date.now() > entry.resetAt) {
      this.attempts.delete(ip);
      return;
    }

    if (entry.count >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registerFailure(ip: string) {
    const entry = this.attempts.get(ip);
    if (entry && Date.now() <= entry.resetAt) {
      entry.count += 1;
      return;
    }
    this.attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { ContactService } from './contact.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

@Controller('api')
export class ContactController {
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly contact: ContactService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Body()
    body: {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      website?: string;
    },
    @Ip() ip: string,
  ) {
    // Honeypot : les bots remplissent ce champ caché, on fait semblant de réussir.
    if (body?.website) return { sent: true };

    this.assertNotThrottled(ip);

    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const subject = String(body?.subject ?? '').trim();
    const message = String(body?.message ?? '').trim();

    if (name.length < 2 || name.length > 80) {
      throw new HttpException('Indiquez votre nom (2 à 80 caractères).', HttpStatus.BAD_REQUEST);
    }
    if (!EMAIL_REGEX.test(email) || email.length > 120) {
      throw new HttpException('Adresse e-mail invalide.', HttpStatus.BAD_REQUEST);
    }
    if (subject.length < 3 || subject.length > 120) {
      throw new HttpException('Sujet trop court ou trop long.', HttpStatus.BAD_REQUEST);
    }
    if (message.length < 10 || message.length > 4000) {
      throw new HttpException('Le message doit contenir entre 10 et 4000 caractères.', HttpStatus.BAD_REQUEST);
    }

    await this.contact.send({ name, email, subject, message });
    this.registerAttempt(ip);
    return { sent: true };
  }

  private assertNotThrottled(ip: string) {
    const entry = this.attempts.get(ip);
    if (!entry) return;
    if (Date.now() > entry.resetAt) {
      this.attempts.delete(ip);
      return;
    }
    if (entry.count >= MAX_PER_WINDOW) {
      throw new HttpException(
        'Trop de messages envoyés. Réessayez dans quelques minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registerAttempt(ip: string) {
    const entry = this.attempts.get(ip);
    if (entry && Date.now() <= entry.resetAt) {
      entry.count += 1;
      return;
    }
    this.attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

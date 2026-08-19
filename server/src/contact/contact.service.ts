import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

@Injectable()
export class ContactService {
  constructor(private readonly config: ConfigService) {}

  async send(payload: ContactPayload) {
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const secure =
      this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;

    if (!host || !user || !pass) {
      throw new ServiceUnavailableException(
        'L’envoi d’e-mail n’est pas configuré. Renseignez SMTP_HOST, SMTP_USER et SMTP_PASS.',
      );
    }

    const to =
      this.config.get<string>('CONTACT_TO')?.trim() ||
      this.config.get<string>('ADMIN_EMAIL')?.trim() ||
      user;
    const from = this.config.get<string>('CONTACT_FROM')?.trim() || user;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const subject = `[Portfolio] ${payload.subject}`;
    const text = [payload.message, '', '—', payload.name, payload.email].join('\n');
    const html = `
      <p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>
      <hr />
      <p><strong>${escapeHtml(payload.name)}</strong><br />
      <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
    `;

    try {
      await transporter.sendMail({
        from,
        to,
        replyTo: payload.email,
        subject,
        text,
        html,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Impossible d’envoyer le message. Vérifiez les identifiants SMTP.',
      );
    }
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

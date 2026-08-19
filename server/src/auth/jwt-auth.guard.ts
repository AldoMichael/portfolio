import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Protège les routes d'écriture : exige un en-tête
 * `Authorization: Bearer <jeton>` valide.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Jeton d’authentification manquant.');
    }

    try {
      (request as any).user = await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Session expirée, veuillez vous reconnecter.');
    }
  }
}

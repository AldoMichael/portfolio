import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './admin-user.entity';
import { hashPassword, verifyPassword } from './password';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser) private readonly users: Repository<AdminUser>,
    private readonly jwt: JwtService,
  ) {}

  /** Vérifie les identifiants et renvoie un jeton JWT en cas de succès. */
  async login(email: unknown, password: unknown) {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const plainPassword = String(password ?? '');

    const user = await this.users.findOne({ where: { email: normalizedEmail } });

    // Message volontairement identique dans les deux cas : on n'indique pas
    // si c'est l'email ou le mot de passe qui est erroné.
    if (!user || !(await verifyPassword(plainPassword, user.passwordHash))) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      email: user.email,
    };
  }

  /**
   * Crée le compte administrateur s'il n'existe pas encore,
   * ou met son mot de passe à jour. Appelé par le script de seed.
   */
  async upsertAdmin(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const existing = await this.users.findOne({ where: { email: normalizedEmail } });

    if (existing) {
      existing.passwordHash = passwordHash;
      return this.users.save(existing);
    }

    return this.users.save(this.users.create({ email: normalizedEmail, passwordHash }));
  }
}

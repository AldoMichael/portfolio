import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Le secret JWT n'a pas de valeur par défaut : mieux vaut refuser de démarrer
  // que d'exposer une API d'administration signée avec une clé connue.
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET est manquant. Copiez server/.env.example vers server/.env et renseignez-le.',
    );
  }

  const app = await NestFactory.create(AppModule);

  // Seules les origines déclarées peuvent appeler l'API depuis un navigateur.
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: origins, credentials: true });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  Logger.log(`API disponible sur http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();

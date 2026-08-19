/**
 * ============================================================================
 *  POINT D'ENTRÉE SERVERLESS (VERCEL)
 * ----------------------------------------------------------------------------
 *  Vercel n'exécute pas un serveur permanent : il appelle une fonction à chaque
 *  requête. On amorce donc Nest une seule fois par instance, puis on délègue
 *  chaque requête à l'application Express sous-jacente.
 *
 *  Le serveur classique (src/main.ts) reste utilisable pour le développement
 *  local et pour un hébergement Node traditionnel.
 * ============================================================================
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();

/** Promesse d'amorçage, partagée par toutes les requêtes d'une même instance. */
let bootstrapping: Promise<void> | null = null;

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET est manquant dans les variables d’environnement Vercel.');
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  const origins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error(
      'CORS_ORIGIN est manquante : renseignez l’URL du site autorisé à appeler l’API.',
    );
  }

  app.enableCors({ origin: origins, credentials: true });
  await app.init();
}

export default async function handler(request: Request, response: Response) {
  if (!bootstrapping) bootstrapping = bootstrap();

  try {
    await bootstrapping;
  } catch (error) {
    // Un amorçage raté ne doit pas être mis en cache : la prochaine requête réessaie.
    bootstrapping = null;
    response.status(500).json({
      message: error instanceof Error ? error.message : 'Erreur de démarrage de l’API.',
    });
    return;
  }

  server(request, response);
}

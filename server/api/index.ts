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

function allowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** Transforme `https://foo-*.vercel.app` en expression régulière. */
function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+');
  return new RegExp(`^${escaped}$`, 'i');
}

/**
 * Les déploiements Preview Vercel ont une URL du type
 * `https://projet-hash-equipe.vercel.app`, différente du domaine de production
 * `https://projet-equipe.vercel.app`. On les autorise automatiquement.
 */
function isVercelPreviewOf(origin: string, productionOrigin: string): boolean {
  const match = productionOrigin.match(
    /^https:\/\/([a-z0-9]+)-((?:[a-z0-9]+-)*[a-z0-9]+)\.vercel\.app$/i,
  );
  if (!match) return false;
  const preview = new RegExp(
    `^https://${match[1]}-[a-z0-9]+-${match[2]}\\.vercel\\.app$`,
    'i',
  );
  return preview.test(origin);
}

function isOriginAllowed(origin: string): boolean {
  const normalized = origin.replace(/\/$/, '');
  if (!normalized) return false;

  return allowedOrigins().some((pattern) => {
    if (pattern === normalized) return true;
    if (pattern.includes('*') && wildcardToRegExp(pattern).test(normalized)) return true;
    return !pattern.includes('*') && isVercelPreviewOf(normalized, pattern);
  });
}

/**
 * Pose les en-têtes CORS avant même l'amorçage de Nest.
 * Sinon le preflight OPTIONS du navigateur échoue (pas d'Access-Control-Allow-Origin)
 * dès que la fonction met trop de temps à se connecter à la base.
 */
function applyCors(request: Request, response: Response): boolean {
  const origin = String(request.headers.origin ?? '').replace(/\/$/, '');
  const ok = isOriginAllowed(origin);

  if (ok) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Max-Age', '86400');
  }

  return ok;
}

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET est manquant dans les variables d’environnement Vercel.');
  }

  const origins = allowedOrigins();
  if (origins.length === 0) {
    throw new Error(
      'CORS_ORIGIN est manquante : renseignez l’URL du site autorisé à appeler l’API.',
    );
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin || isOriginAllowed(requestOrigin)) callback(null, true);
      else callback(null, false);
    },
    credentials: true,
  });
  await app.init();
}

export default async function handler(request: Request, response: Response) {
  applyCors(request, response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

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

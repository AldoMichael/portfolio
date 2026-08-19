/**
 * ============================================================================
 *  SCRIPT DE PEUPLEMENT DE LA BASE
 * ----------------------------------------------------------------------------
 *  Usage :
 *    npm run seed            → n'insère que dans les tables vides (sans risque)
 *    npm run seed -- --reset → vide les tables de contenu puis réinsère tout
 *
 *  Le compte administrateur est créé ou mis à jour à partir des variables
 *  ADMIN_EMAIL et ADMIN_PASSWORD du fichier .env.
 * ============================================================================
 */

import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource, DeepPartial, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import {
  Education,
  Experience,
  Language,
  Project,
  Setting,
  SkillGroup,
  Stat,
} from './content/entities';
import {
  seedEducation,
  seedExperiences,
  seedLanguages,
  seedProjects,
  seedSettings,
  seedSkillGroups,
  seedStats,
} from './seed-data';

const logger = new Logger('Seed');
const reset = process.argv.includes('--reset');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const dataSource = app.get(DataSource);

  /** Insère les données d'une table si elle est vide (ou si --reset est passé). */
  async function fill<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    label: string,
    rows: Record<string, unknown>[],
  ) {
    const repository: Repository<T> = dataSource.getRepository(entity);

    if (reset) {
      await repository.clear();
    } else if ((await repository.count()) > 0) {
      logger.log(`${label} : déjà peuplée, ignorée.`);
      return;
    }

    // `position` reprend l'ordre du tableau : c'est l'ordre d'affichage du site.
    const entities = rows.map((row, index) =>
      repository.create({ ...row, position: index } as unknown as DeepPartial<T>),
    );
    await repository.save(entities);
    logger.log(`${label} : ${rows.length} élément(s) inséré(s).`);
  }

  await fill(Experience, 'Parcours', seedExperiences);
  await fill(SkillGroup, 'Technologies', seedSkillGroups);
  await fill(Stat, 'Statistiques', seedStats);
  await fill(Project, 'Applications métier', seedProjects);
  await fill(Education, 'Formation', seedEducation);
  await fill(Language, 'Langues', seedLanguages);
  await fill(Setting, 'Réglages', seedSettings);

  /* --------------------------- Compte administrateur ------------------------- */

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD absents du .env : aucun compte créé.');
  } else {
    await app.get(AuthService).upsertAdmin(email, password);
    logger.log(`Compte administrateur prêt : ${email}`);
  }

  await app.close();
  logger.log('Peuplement terminé.');
}

run().catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

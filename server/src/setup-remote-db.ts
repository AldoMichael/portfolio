/**
 * ============================================================================
 *  INITIALISATION D'UNE BASE DISTANTE (NEON)
 * ----------------------------------------------------------------------------
 *  Crée le schéma puis insère le contenu initial en passant par le driver HTTP
 *  de Neon, qui dialogue en HTTPS sur le port 443. C'est indispensable depuis
 *  un réseau où le port PostgreSQL (5432) est bloqué.
 *
 *  Usage : npm run db:setup
 *
 *  Le script est sans risque : le schéma utilise CREATE TABLE IF NOT EXISTS et
 *  les données ne sont insérées que dans les tables vides.
 * ============================================================================
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hashPassword } from './auth/password';
import {
  seedEducation,
  seedExperiences,
  seedLanguages,
  seedProjects,
  seedSettings,
  seedSkillGroups,
  seedStats,
} from './seed-data';

// NEON_DATABASE_URL permet de viser la base distante depuis un poste dont
// l'API locale, elle, continue de travailler sur PostgreSQL en local.
const databaseUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('NEON_DATABASE_URL (ou DATABASE_URL) est absente de server/.env.');
  process.exit(1);
}

const sql = neon(databaseUrl);

/** Exécute une requête et renvoie toujours un tableau de lignes. */
async function query(text: string, params: unknown[] = []): Promise<any[]> {
  const result: any = await sql.query(text, params);
  return Array.isArray(result) ? result : (result?.rows ?? []);
}

/* --------------------------------- Schéma ---------------------------------- */

async function createSchema() {
  const file = readFileSync(join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');

  // Les commentaires sont retirés avant le découpage sur « ; ».
  const statements = file
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await query(statement);
  }

  console.log(`Schéma appliqué (${statements.length} instructions).`);
}

/* -------------------------------- Contenu ---------------------------------- */

/** Insère les lignes si la table est vide, en respectant l'ordre du tableau. */
async function fill(table: string, columns: string[], rows: Record<string, unknown>[]) {
  const [{ n }] = await query(`SELECT count(*)::int AS n FROM "${table}"`);
  if (n > 0) {
    console.log(`${table} : ${n} ligne(s) déjà présente(s), ignorée.`);
    return;
  }

  for (const [index, row] of rows.entries()) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const quoted = columns.map((column) => `"${column}"`).join(', ');

    await query(
      `INSERT INTO "${table}" (${quoted}, "position") VALUES (${placeholders}, $${columns.length + 1})`,
      [...columns.map((column) => row[column]), index],
    );
  }

  console.log(`${table} : ${rows.length} ligne(s) insérée(s).`);
}

/* ------------------------------ Compte admin -------------------------------- */

async function upsertAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD absents : aucun compte créé.');
    return;
  }

  await query(
    `INSERT INTO "admin_users" ("email", "password_hash") VALUES ($1, $2)
     ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"`,
    [email, await hashPassword(password)],
  );

  console.log(`Compte administrateur prêt : ${email}`);
}

/* --------------------------------- Exécution -------------------------------- */

async function run() {
  await createSchema();

  await fill(
    'experiences',
    ['period', 'role', 'company', 'location', 'current', 'tasks', 'tags'],
    seedExperiences,
  );
  await fill('skill_groups', ['title', 'description', 'icon', 'items'], seedSkillGroups);
  await fill('stats', ['value', 'suffix', 'label'], seedStats);
  await fill(
    'projects',
    ['title', 'client', 'location', 'date', 'summary', 'highlights', 'tags'],
    seedProjects,
  );
  await fill('education', ['degree', 'school', 'year', 'detail'], seedEducation);
  await fill('languages', ['name', 'level', 'value'], seedLanguages);
  await fill('settings', ['key', 'label', 'value'], seedSettings);

  await upsertAdmin();

  console.log('Base distante prête.');
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

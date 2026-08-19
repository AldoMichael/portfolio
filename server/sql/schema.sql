-- ============================================================================
--  SCHÉMA DE LA BASE DU PORTFOLIO
-- ----------------------------------------------------------------------------
--  Reproduit exactement les entités de src/content/entities.ts et
--  src/auth/admin-user.entity.ts, pour pouvoir faire tourner l'API en
--  production avec DB_SYNCHRONIZE=false.
--
--  À exécuter soit par « npm run db:setup », soit en collant ce fichier
--  dans l'éditeur SQL du tableau de bord Neon.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "experiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "period" varchar(120) NOT NULL,
  "role" varchar(160) NOT NULL,
  "company" varchar(160) NOT NULL,
  "location" varchar(160) NOT NULL,
  "current" boolean NOT NULL DEFAULT false,
  "tasks" text[] NOT NULL DEFAULT '{}',
  "tags" text[] NOT NULL DEFAULT '{}',
  "url" varchar(500) NOT NULL DEFAULT '',
  "demo_url" varchar(500) NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "skill_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(160) NOT NULL,
  "description" varchar(255) NOT NULL DEFAULT '',
  "icon" varchar(32) NOT NULL DEFAULT 'code',
  "items" text[] NOT NULL DEFAULT '{}',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "stats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "value" integer NOT NULL DEFAULT 0,
  "suffix" varchar(8) NOT NULL DEFAULT '',
  "label" varchar(160) NOT NULL,
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(200) NOT NULL,
  "client" varchar(160) NOT NULL,
  "location" varchar(160) NOT NULL,
  "date" varchar(60) NOT NULL,
  "summary" text NOT NULL DEFAULT '',
  "highlights" text[] NOT NULL DEFAULT '{}',
  "tags" text[] NOT NULL DEFAULT '{}',
  "url" varchar(500) NOT NULL DEFAULT '',
  "demo_url" varchar(500) NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "education" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "degree" varchar(200) NOT NULL,
  "school" varchar(200) NOT NULL,
  "year" varchar(60) NOT NULL,
  "detail" text NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "languages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(120) NOT NULL,
  "level" varchar(120) NOT NULL,
  "value" integer NOT NULL DEFAULT 50,
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "socials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "label" varchar(80) NOT NULL,
  "href" varchar(500) NOT NULL DEFAULT '',
  "icon" varchar(32) NOT NULL DEFAULT 'linkedin',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "logo_url" varchar(500) NOT NULL DEFAULT '',
  "href" varchar(500) NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar(80) NOT NULL UNIQUE,
  "label" varchar(160) NOT NULL DEFAULT '',
  "value" text NOT NULL DEFAULT '',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "profile_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mime" varchar(80) NOT NULL,
  "data" bytea NOT NULL,
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "profile_cvs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "mime" varchar(80) NOT NULL,
  "filename" varchar(180) NOT NULL DEFAULT 'cv.pdf',
  "data" bytea NOT NULL,
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(180) NOT NULL UNIQUE,
  "password_hash" varchar(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

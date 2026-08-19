/**
 * ============================================================================
 *  ENTITÉS DE CONTENU
 * ----------------------------------------------------------------------------
 *  Chaque entité correspond à une table PostgreSQL et à une section éditable
 *  du portfolio depuis l'interface d'administration.
 *
 *  Le champ `position` sert partout à ordonner l'affichage côté site :
 *  il est piloté par les flèches « monter / descendre » de l'admin.
 * ============================================================================
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Colonne PostgreSQL de type text[] avec un tableau vide par défaut. */
const textArray = { type: 'text' as const, array: true, default: () => "'{}'" };

/** Colonnes communes à toutes les entités de contenu. */
abstract class ContentBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Ordre d'affichage sur le site (croissant). */
  @Column('int', { default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/* --------------------------- Parcours professionnel ------------------------ */

@Entity('experiences')
export class Experience extends ContentBase {
  /** Période affichée telle quelle, ex. « 01/2024 – 05/2025 ». */
  @Column('varchar', { length: 120 })
  period: string;

  @Column('varchar', { length: 160 })
  role: string;

  @Column('varchar', { length: 160 })
  company: string;

  @Column('varchar', { length: 160 })
  location: string;

  /** Met en avant le poste le plus récent avec un badge et un halo animé. */
  @Column('boolean', { default: false })
  current: boolean;

  @Column(textArray)
  tasks: string[];

  @Column(textArray)
  tags: string[];

  /** Lien vers l'application ou le site : rend la carte cliquable. */
  @Column('varchar', { length: 500, default: '' })
  url: string;

  /** Lien vers une démonstration : affiche un bouton dédié. */
  @Column('varchar', { length: 500, name: 'demo_url', default: '' })
  demoUrl: string;
}

/* ------------------------------- Technologies ------------------------------ */

@Entity('skill_groups')
export class SkillGroup extends ContentBase {
  @Column('varchar', { length: 160 })
  title: string;

  @Column('varchar', { length: 255, default: '' })
  description: string;

  /** Nom d'icône Lucide : code | server | database | shield. */
  @Column('varchar', { length: 32, default: 'code' })
  icon: string;

  /** Liste des technologies affichées en badges. */
  @Column(textArray)
  items: string[];
}

/* ------------------- Statistiques / années d'expérience -------------------- */

@Entity('stats')
export class Stat extends ContentBase {
  /** Valeur numérique animée par le compteur du site. */
  @Column('int', { default: 0 })
  value: number;

  /** Suffixe accolé au nombre, ex. « + ». */
  @Column('varchar', { length: 8, default: '' })
  suffix: string;

  @Column('varchar', { length: 160 })
  label: string;
}

/* --------------------- Applications métier (projets) ----------------------- */

@Entity('projects')
export class Project extends ContentBase {
  @Column('varchar', { length: 200 })
  title: string;

  @Column('varchar', { length: 160 })
  client: string;

  @Column('varchar', { length: 160 })
  location: string;

  /** Date affichée telle quelle, ex. « 06/2025 ». */
  @Column('varchar', { length: 60 })
  date: string;

  @Column('text', { default: '' })
  summary: string;

  @Column(textArray)
  highlights: string[];

  @Column(textArray)
  tags: string[];

  /** Lien vers l'application ou le site : rend la carte cliquable. */
  @Column('varchar', { length: 500, default: '' })
  url: string;

  /** Lien vers une démonstration : affiche un bouton dédié. */
  @Column('varchar', { length: 500, name: 'demo_url', default: '' })
  demoUrl: string;
}

/* --------------------------------- Formation ------------------------------- */

@Entity('education')
export class Education extends ContentBase {
  @Column('varchar', { length: 200 })
  degree: string;

  @Column('varchar', { length: 200 })
  school: string;

  @Column('varchar', { length: 60 })
  year: string;

  @Column('text', { default: '' })
  detail: string;
}

/* ---------------------------------- Langues -------------------------------- */

@Entity('languages')
export class Language extends ContentBase {
  @Column('varchar', { length: 120 })
  name: string;

  /** Libellé du niveau, ex. « Intermédiaire ». */
  @Column('varchar', { length: 120 })
  level: string;

  /** Pourcentage (0-100) utilisé par la barre de progression animée. */
  @Column('int', { default: 50 })
  value: number;
}

/* ------------------- Réglages divers (clé / valeur libre) ------------------- */

@Entity('settings')
export class Setting extends ContentBase {
  /** Identifiant technique consommé par le front, ex. « yearsOfExperience ». */
  @Column('varchar', { length: 80, unique: true })
  key: string;

  @Column('varchar', { length: 160, default: '' })
  label: string;

  @Column('text', { default: '' })
  value: string;
}

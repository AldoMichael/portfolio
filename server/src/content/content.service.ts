/**
 * ============================================================================
 *  SERVICE DE CONTENU
 * ----------------------------------------------------------------------------
 *  Gère la lecture publique (payload agrégé consommé par le portfolio) et les
 *  opérations d'écriture génériques pilotées par le schéma (schema.ts).
 * ============================================================================
 */

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  Client,
  Education,
  Experience,
  Language,
  Project,
  Setting,
  SkillGroup,
  Social,
  Stat,
} from './entities';
import { FieldDef, RESOURCES, RESOURCE_MAP } from './schema';
import { CvService } from './cv.service';
import { PhotoService } from './photo.service';

/** Tri commun : position croissante, puis date de création. */
const ORDER = { position: 'ASC', createdAt: 'ASC' } as const;

@Injectable()
export class ContentService {
  private readonly repositories: Record<string, Repository<ObjectLiteral>>;

  constructor(
    @InjectRepository(Experience) private readonly experiences: Repository<Experience>,
    @InjectRepository(SkillGroup) private readonly skillGroups: Repository<SkillGroup>,
    @InjectRepository(Stat) private readonly stats: Repository<Stat>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Education) private readonly education: Repository<Education>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(Social) private readonly socials: Repository<Social>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Setting) private readonly settings: Repository<Setting>,
    private readonly photos: PhotoService,
    private readonly cvs: CvService,
  ) {
    this.repositories = {
      experiences: this.experiences as Repository<ObjectLiteral>,
      skills: this.skillGroups as Repository<ObjectLiteral>,
      stats: this.stats as Repository<ObjectLiteral>,
      projects: this.projects as Repository<ObjectLiteral>,
      education: this.education as Repository<ObjectLiteral>,
      languages: this.languages as Repository<ObjectLiteral>,
      socials: this.socials as Repository<ObjectLiteral>,
      clients: this.clients as Repository<ObjectLiteral>,
      settings: this.settings as Repository<ObjectLiteral>,
    };
  }

  /* ----------------------------- Lecture publique ---------------------------- */

  /**
   * Renvoie l'intégralité du contenu dynamique en un seul appel.
   * Le portfolio n'a ainsi qu'une requête à faire au chargement.
   */
  async getPublicContent() {
    const [experiences, skillGroups, stats, projects, education, languages, socials, clients, settings, profilePhotoVersion, cv] =
      await Promise.all([
        this.experiences.find({ order: ORDER }),
        this.skillGroups.find({ order: ORDER }),
        this.stats.find({ order: ORDER }),
        this.projects.find({ order: ORDER }),
        this.education.find({ order: ORDER }),
        this.languages.find({ order: ORDER }),
        this.socials.find({ order: ORDER }),
        this.clients.find({ order: ORDER }).catch(() => [] as Client[]),
        this.settings.find({ order: ORDER }),
        this.photos.getVersion(),
        this.cvs.getMeta(),
      ]);

    return {
      experiences: experiences.map((item) => ({
        period: item.period,
        role: item.role,
        company: item.company,
        location: item.location,
        current: item.current,
        tasks: item.tasks ?? [],
        tags: item.tags ?? [],
        url: item.url || undefined,
        demoUrl: item.demoUrl || undefined,
      })),
      skillGroups: skillGroups.map((group) => ({
        title: group.title,
        description: group.description,
        icon: group.icon,
        items: group.items ?? [],
      })),
      stats: stats.map((stat) => ({
        value: stat.value,
        suffix: stat.suffix,
        label: stat.label,
      })),
      projects: projects.map((project) => ({
        title: project.title,
        client: project.client,
        location: project.location,
        date: project.date,
        summary: project.summary,
        highlights: project.highlights ?? [],
        tags: project.tags ?? [],
        url: project.url || undefined,
        demoUrl: project.demoUrl || undefined,
      })),
      education: education.map((item) => ({
        degree: item.degree,
        school: item.school,
        year: item.year,
        detail: item.detail || undefined,
      })),
      languages: languages.map((language) => ({
        name: language.name,
        level: language.level,
        value: language.value,
      })),
      socials: socials.map((social) => ({
        label: social.label,
        href: social.href,
        icon: social.icon,
      })),
      clients: clients.map((client) => ({
        name: client.name,
        logoUrl: client.logoUrl || undefined,
        href: client.href || undefined,
      })),
      // Transformé en objet clé → valeur, plus pratique à consommer côté front.
      settings: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
      profilePhotoVersion,
      cvVersion: cv?.version ?? null,
      cvFilename: cv?.filename ?? null,
    };
  }

  /* ------------------------------ Administration ----------------------------- */

  /** Liste brute (avec id et position) utilisée par l'interface d'admin. */
  async list(resource: string) {
    return this.repositoryFor(resource).find({ order: ORDER });
  }

  async create(resource: string, body: unknown) {
    const repository = this.repositoryFor(resource);
    const data = this.sanitize(resource, body, false);

    // La nouvelle entrée est placée en fin de liste.
    const last = await repository.find({ order: { position: 'DESC' }, take: 1 });
    data.position = (last[0]?.position ?? -1) + 1;

    return this.save(repository, repository.create(data));
  }

  async update(resource: string, id: string, body: unknown) {
    const repository = this.repositoryFor(resource);
    const entity = await repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Élément introuvable.');

    Object.assign(entity, this.sanitize(resource, body, true));
    return this.save(repository, entity);
  }

  async remove(resource: string, id: string) {
    const repository = this.repositoryFor(resource);
    const result = await repository.delete(id);
    if (!result.affected) throw new NotFoundException('Élément introuvable.');
    return { deleted: true };
  }

  /** Réordonne une ressource à partir de la liste d'identifiants reçue. */
  async reorder(resource: string, ids: unknown) {
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
      throw new BadRequestException('Le corps doit contenir un tableau « ids ».');
    }

    const repository = this.repositoryFor(resource);
    await Promise.all(
      (ids as string[]).map((id, index) => repository.update(id, { position: index })),
    );

    return this.list(resource);
  }

  /* -------------------------------- Utilitaires ------------------------------ */

  /** Renvoie le dépôt TypeORM d'une ressource, ou 404 si le nom est inconnu. */
  private repositoryFor(resource: string): Repository<ObjectLiteral> {
    const repository = this.repositories[resource];
    if (!repository) {
      throw new NotFoundException(
        `Ressource « ${resource} » inconnue. Valeurs acceptées : ${RESOURCES.map((r) => r.key).join(', ')}.`,
      );
    }
    return repository;
  }

  /** Enregistre en traduisant les erreurs PostgreSQL en réponses lisibles. */
  private async save(repository: Repository<ObjectLiteral>, entity: ObjectLiteral) {
    try {
      return await repository.save(entity);
    } catch (error: any) {
      // 23505 = violation de contrainte d'unicité (clé de réglage déjà utilisée).
      if (error?.code === '23505') {
        throw new BadRequestException('Cette valeur existe déjà et doit être unique.');
      }
      throw error;
    }
  }

  /**
   * Filtre le corps de la requête selon le schéma de la ressource :
   * seuls les champs déclarés sont conservés, et chacun est converti
   * dans le type attendu. En mode `partial`, les champs absents sont ignorés.
   */
  private sanitize(resource: string, body: unknown, partial: boolean) {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('Le corps de la requête doit être un objet.');
    }

    const definition = RESOURCE_MAP.get(resource);
    if (!definition) throw new NotFoundException(`Ressource « ${resource} » inconnue.`);

    const source = body as Record<string, unknown>;
    const result: Record<string, any> = {};

    for (const field of definition.fields) {
      const provided = Object.prototype.hasOwnProperty.call(source, field.name);
      if (!provided) {
        if (partial) continue;
        if (field.required) throw new BadRequestException(`Le champ « ${field.label} » est requis.`);
        result[field.name] = this.emptyValue(field);
        continue;
      }
      result[field.name] = this.coerce(field, source[field.name]);
    }

    // La position reste pilotée par l'endpoint de réordonnancement.
    if (typeof source.position === 'number' && Number.isFinite(source.position)) {
      result.position = Math.trunc(source.position);
    }

    return result;
  }

  /** Valeur par défaut d'un champ optionnel non fourni à la création. */
  private emptyValue(field: FieldDef) {
    switch (field.type) {
      case 'list':
        return [];
      case 'number':
        return field.min ?? 0;
      case 'boolean':
        return false;
      case 'select':
        return field.options?.[0] ?? '';
      default:
        return '';
    }
  }

  /** Convertit et valide une valeur reçue selon le type déclaré du champ. */
  private coerce(field: FieldDef, raw: unknown) {
    switch (field.type) {
      case 'number': {
        const parsed = typeof raw === 'string' ? Number(raw) : raw;
        if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
          throw new BadRequestException(`Le champ « ${field.label} » doit être un nombre.`);
        }
        const min = field.min ?? Number.MIN_SAFE_INTEGER;
        const max = field.max ?? Number.MAX_SAFE_INTEGER;
        return Math.min(Math.max(Math.trunc(parsed), min), max);
      }

      case 'boolean':
        return raw === true || raw === 'true';

      case 'url': {
        const value = String(raw ?? '').trim();
        if (!value) {
          if (field.required) throw new BadRequestException(`Le champ « ${field.label} » est requis.`);
          return '';
        }
        // Seuls http(s) et les chemins internes sont acceptés : cela écarte
        // les URLs « javascript: » qui seraient exécutées au clic sur la carte.
        if (!/^https?:\/\//i.test(value) && !value.startsWith('/')) {
          throw new BadRequestException(
            `Le champ « ${field.label} » doit commencer par http:// ou https://.`,
          );
        }
        return value;
      }

      case 'list': {
        // Accepte un tableau ou un texte multiligne (une entrée par ligne).
        const values = Array.isArray(raw) ? raw : String(raw ?? '').split('\n');
        return values.map((value) => String(value).trim()).filter(Boolean);
      }

      case 'select': {
        const value = String(raw ?? '').trim();
        if (field.options && !field.options.includes(value)) {
          throw new BadRequestException(
            `Le champ « ${field.label} » doit valoir : ${field.options.join(', ')}.`,
          );
        }
        return value;
      }

      default: {
        const value = String(raw ?? '').trim();
        if (field.required && !value) {
          throw new BadRequestException(`Le champ « ${field.label} » est requis.`);
        }
        return value;
      }
    }
  }
}

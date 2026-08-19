import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilePhoto } from './entities';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(ProfilePhoto) private readonly photos: Repository<ProfilePhoto>,
  ) {}

  async getLatest(): Promise<ProfilePhoto | null> {
    const rows = await this.photos.find({ order: { updatedAt: 'DESC' }, take: 1 });
    return rows[0] ?? null;
  }

  /** Horodatage pour invalider le cache navigateur après un nouvel upload. */
  async getVersion(): Promise<number | null> {
    try {
      const photo = await this.getLatest();
      return photo ? photo.updatedAt.getTime() : null;
    } catch {
      return null;
    }
  }

  async save(file: { mimetype: string; size: number; buffer: Buffer } | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Aucun fichier reçu. Choisissez une image JPEG, PNG ou WebP.');
    }
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Formats acceptés : JPEG, PNG, WebP.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('L’image ne doit pas dépasser 2 Mo.');
    }

    const existing = await this.getLatest();
    const entity = existing ?? this.photos.create();
    entity.mime = file.mimetype;
    entity.data = file.buffer;
    return this.photos.save(entity);
  }

  async remove() {
    const existing = await this.getLatest();
    if (!existing) throw new NotFoundException('Aucune photo de profil.');
    await this.photos.remove(existing);
    return { deleted: true };
  }
}

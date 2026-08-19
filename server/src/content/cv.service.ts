import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileCv } from './entities';

const MAX_BYTES = 4 * 1024 * 1024;

function isPdf(file: { mimetype: string; originalname?: string }) {
  const mime = (file.mimetype || '').toLowerCase();
  const name = (file.originalname || '').toLowerCase();
  return mime === 'application/pdf' || mime === 'application/x-pdf' || name.endsWith('.pdf');
}

function safeFilename(name: string | undefined) {
  const cleaned = (name || 'cv.pdf')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '-')
    .slice(0, 120);
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(ProfileCv) private readonly cvs: Repository<ProfileCv>,
  ) {}

  async getLatest(): Promise<ProfileCv | null> {
    const rows = await this.cvs.find({ order: { updatedAt: 'DESC' }, take: 1 });
    return rows[0] ?? null;
  }

  async getMeta(): Promise<{ version: number; filename: string } | null> {
    try {
      const cv = await this.getLatest();
      if (!cv) return null;
      return { version: cv.updatedAt.getTime(), filename: cv.filename };
    } catch {
      return null;
    }
  }

  async save(file: { mimetype: string; size: number; buffer: Buffer; originalname?: string } | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Aucun fichier reçu. Choisissez un PDF.');
    }
    if (!isPdf(file)) {
      throw new BadRequestException('Le CV doit être un fichier PDF. Le site ne génère pas de CV.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Le PDF ne doit pas dépasser 4 Mo.');
    }

    const existing = await this.getLatest();
    const entity = existing ?? this.cvs.create();
    entity.mime = 'application/pdf';
    entity.filename = safeFilename(file.originalname);
    entity.data = file.buffer;
    return this.cvs.save(entity);
  }

  async remove() {
    const existing = await this.getLatest();
    if (!existing) throw new NotFoundException('Aucun CV.');
    await this.cvs.remove(existing);
    return { deleted: true };
  }
}

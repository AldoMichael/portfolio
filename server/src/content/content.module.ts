import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { Education, Experience, Language, Project, Setting, SkillGroup, Social, Stat, ProfilePhoto } from './entities';

export const CONTENT_ENTITIES = [
  Experience,
  SkillGroup,
  Stat,
  Project,
  Education,
  Language,
  Social,
  Setting,
  ProfilePhoto,
];

@Module({
  imports: [TypeOrmModule.forFeature(CONTENT_ENTITIES)],
  controllers: [ContentController, PhotoController],
  providers: [ContentService, PhotoService],
  exports: [ContentService, PhotoService],
})
export class ContentModule {}

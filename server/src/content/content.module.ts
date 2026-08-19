import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientLogoController } from './client-logo.controller';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { Education, Experience, Language, Project, Setting, SkillGroup, Social, Stat, ProfilePhoto, ProfileCv, Client } from './entities';

export const CONTENT_ENTITIES = [
  Experience,
  SkillGroup,
  Stat,
  Project,
  Education,
  Language,
  Social,
  Client,
  Setting,
  ProfilePhoto,
  ProfileCv,
];

@Module({
  imports: [TypeOrmModule.forFeature(CONTENT_ENTITIES)],
  controllers: [ContentController, PhotoController, CvController, ClientLogoController],
  providers: [ContentService, PhotoService, CvService],
  exports: [ContentService, PhotoService, CvService],
})
export class ContentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Education, Experience, Language, Project, Setting, SkillGroup, Stat } from './entities';

export const CONTENT_ENTITIES = [
  Experience,
  SkillGroup,
  Stat,
  Project,
  Education,
  Language,
  Setting,
];

@Module({
  imports: [TypeOrmModule.forFeature(CONTENT_ENTITIES)],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}

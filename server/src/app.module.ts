import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from './auth/admin-user.entity';
import { AuthModule } from './auth/auth.module';
import { CONTENT_ENTITIES, ContentModule } from './content/content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST') ?? 'localhost',
        port: Number(config.get<string>('DB_PORT') ?? 5432),
        username: config.get<string>('DB_USER') ?? 'postgres',
        password: config.get<string>('DB_PASSWORD') ?? '',
        database: config.get<string>('DB_NAME') ?? 'portfolio',
        entities: [...CONTENT_ENTITIES, AdminUser],
        // En développement, TypeORM crée et met à jour les tables tout seul.
        // À passer à « false » en production au profit de migrations.
        synchronize: config.get<string>('DB_SYNCHRONIZE') !== 'false',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),

    AuthModule,
    ContentModule,
  ],
})
export class AppModule {}

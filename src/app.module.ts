import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Prefer a single DATABASE_URL if provided (Aptible typically supplies a URL)
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            synchronize: false,
            autoLoadEntities: true,
            ssl: config.get<boolean>('DB_SSL') === true || config.get<string>('DB_SSL') === 'true',
          } as any;
        }

        // Fallback to discrete env vars for local development
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get<number>('DB_PORT', 5432)),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASS', ''),
          database: config.get<string>('DB_NAME', 'app_db'),
          synchronize: false,
          autoLoadEntities: true,
          ssl: config.get<boolean>('DB_SSL') === true || config.get<string>('DB_SSL') === 'true',
        } as any;
      },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}

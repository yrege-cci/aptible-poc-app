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

        // Determine SSL options:
        // - If env DB_SSL is 'true' or true, enable SSL and allow self-signed certs
        // - If DATABASE_URL contains sslmode=require, enable SSL similarly
        const dbSslEnv = config.get<any>('DB_SSL');
        const sslRequested = dbSslEnv === true || dbSslEnv === 'true' || (databaseUrl && databaseUrl.includes('sslmode=require'));
        const sslOption = sslRequested ? { rejectUnauthorized: false } : false;

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            synchronize: false,
            autoLoadEntities: true,
            ssl: sslOption,
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
          ssl: sslOption,
        } as any;
      },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}

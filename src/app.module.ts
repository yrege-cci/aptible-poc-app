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
          // If SSL is requested but the URL doesn't include sslmode, append it so pg uses TLS
          let finalUrl = databaseUrl;
          try {
            const hasSslmode = /[?&]sslmode=/i.test(databaseUrl);
            if (sslRequested && !hasSslmode) {
              finalUrl = databaseUrl.includes('?') ? `${databaseUrl}&sslmode=require` : `${databaseUrl}?sslmode=require`;
            }
          } catch (e) {
            // ignore URL parsing errors and fall back to original URL
            finalUrl = databaseUrl;
          }

          // Log that SSL is enabled for DB connections (do not log the URL)
          // eslint-disable-next-line no-console
          console.log('Database SSL:', sslRequested ? 'enabled' : 'disabled');

          return {
            type: 'postgres',
            url: finalUrl,
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

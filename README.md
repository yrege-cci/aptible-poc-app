# aptible-poc-app

Minimal NestJS proof-of-concept prepared for deployment to Aptible.

Key points
- The application reads database connection configuration from environment variables.
- For Aptible deployments, set configuration variables using the Aptible dashboard or the Aptible CLI. The app prefers a single `DATABASE_URL` (recommended).
- For local development you can use the discrete variables shown in `.env.example`.

Suggested Aptible steps
1. Build and push a Docker image (or use Aptible buildpack flow).
2. In the Aptible app configuration (dashboard or CLI), set the database variables. This project looks for `DATABASE_URL` first, and falls back to `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and `DB_NAME`.
3. If your database requires TLS/SSL, set `DB_SSL=true` in Aptible config.

Local run (dev)
1. Copy `.env.example` to `.env` and update values.
2. Install dependencies and run in dev mode:

```bash
npm install
npm run start:dev
```

Notes
- This scaffold configures TypeORM to `autoLoadEntities: true` and `synchronize: false` to avoid accidental schema changes in production. Adjust to your needs.
- For Aptible-specific documentation see Aptible's official docs and the Aptible dashboard for setting environment variables.

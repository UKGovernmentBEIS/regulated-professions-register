import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

const entities = process.env['ENTITIES'] || './dist/**/*.entity.js';

let databaseUrl: string | undefined;

if (process.env.DATABASE_CREDENTIALS) {
  const json = JSON.parse(process.env.DATABASE_CREDENTIALS);
  databaseUrl = `${json.engine}://${json.username}:${json.password}@${json.host}:${json.port}/${json.dbname}`;
} else {
  // GovPaas / Local dev / Github
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

export default registerAs('database', () => {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities: [entities],
    synchronize: false,
    migrations: ['./dist/db/migrate/*.js'],
    migrationsRun: true,
    dropSchema: process.env.NODE_ENV == 'test',
    cli: {
      migrationsDir: 'src/db/migrate',
    },
    extra: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    },
  };
});

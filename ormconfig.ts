process.env.NODE_ENV ||= 'development';

import { ConfigModule } from '@nestjs/config';
import dbConfiguration from './src/config/db.config';
import { DataSource } from 'typeorm';

ConfigModule.forRoot({
  isGlobal: true,
  load: [dbConfiguration],
});

export default dbConfiguration();

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

export const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [entities],
  synchronize: false,
  migrations: ['./dist/db/migrate/*.js'],
  migrationsRun: true,
  dropSchema: process.env.NODE_ENV == 'test',
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
});

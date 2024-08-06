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

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
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

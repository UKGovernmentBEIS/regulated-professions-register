import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

export default registerAs('database', () => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['./dist/**/*.entity.js'],
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

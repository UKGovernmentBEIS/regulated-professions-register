import { registerAs } from '@nestjs/config';
import { config as setConfig } from 'dotenv';

setConfig({ path: `.env.${process.env.NODE_ENV}` });

export default registerAs('database', () => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['./dist/**/*.entity.js'],
    synchronize: process.env.NODE_ENV === 'development',
    migrations: ['./dist/db/migrate/*.js'],
    migrationsRun: true,
    dropSchema: process.env.NODE_ENV == 'test',
    cli: {
      migrationsDir: 'src/db/migrate',
    },
  };
});

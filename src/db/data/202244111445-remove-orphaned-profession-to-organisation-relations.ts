// Run me with `npm run data:migrate ./src/db/data/202244111445-remove-orphaned-profession-to-organisation-relations.ts`

process.env['ENTITIES'] = __dirname + './../../**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Repository } from 'typeorm';
import { ProfessionToOrganisation } from '../../professions/profession-to-organisation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function migrate() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const repository = application.get<Repository<ProfessionToOrganisation>>(
    getRepositoryToken(ProfessionToOrganisation),
  );

  await repository.delete({ profession: null });

  await application.close();
  process.exit(0);
}

migrate();

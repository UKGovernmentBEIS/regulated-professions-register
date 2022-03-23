process.env['ENTITIES'] = __dirname + '/**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ProfessionVersionsService } from './professions/profession-versions.service';
import { ProfessionsSearchService } from './professions/professions-search.service';

import { OrganisationVersionsService } from './organisations/organisation-versions.service';
import { OrganisationsSearchService } from './organisations/organisations-search.service';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];

  switch (command) {
    case 'opensearch:reseed:professions':
      console.log('Reseeding professions...');

      const professionVersionsService = application.get(
        ProfessionVersionsService,
      );
      const professionsSearchService = application.get(
        ProfessionsSearchService,
      );

      await professionsSearchService.deleteAll();

      const professions = await professionVersionsService.allLive();

      for (const profession of professions) {
        professionsSearchService.index(profession);
      }

      break;
    case 'opensearch:reseed:organisations':
      console.log('Reseeding organisations...');

      const organisationVersionsService = application.get(
        OrganisationVersionsService,
      );
      const organisationsSearchService = application.get(
        OrganisationsSearchService,
      );

      await organisationsSearchService.deleteAll();

      const orgs = await organisationVersionsService.all();

      for (const org of orgs) {
        organisationsSearchService.index(org);
      }

      break;
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();

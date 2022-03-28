// Run me with `npm run data:migrate ./src/db/data/20223828934-update-organisation-relations.ts`

process.env['ENTITIES'] = __dirname + './../../**/*.entity.ts';

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';

import { ProfessionVersionsService } from '../../professions/profession-versions.service';

import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../../professions/profession-to-organisation.entity';

async function migrate() {
  const application = await NestFactory.createApplicationContext(AppModule);

  console.log('Updating profession to organisation relations...');

  const professionVersionsService = application.get(ProfessionVersionsService);
  const professionToOrganisationRepository = application.get(
    getRepositoryToken(ProfessionToOrganisation),
  );

  const professions = await professionVersionsService.allWithLatestVersion();
  const professionToOrganisations = [];
  const professionsWithAdditionalOrganisations = [];

  for (const profession of professions) {
    const organisation = profession.organisation;
    const additionalOrganisation = profession.additionalOrganisation;

    professionToOrganisations.push(
      new ProfessionToOrganisation(
        organisation,
        profession,
        OrganisationRole.PrimaryRegulator,
      ),
    );

    if (additionalOrganisation) {
      professionToOrganisations.push(
        new ProfessionToOrganisation(
          additionalOrganisation,
          profession,
          OrganisationRole.PrimaryRegulator,
        ),
      );

      professionsWithAdditionalOrganisations.push(profession);
    }
  }

  await professionToOrganisationRepository.save(professionToOrganisations);

  console.log(
    `Updated ${professions.length} professions, and ${professionsWithAdditionalOrganisations.length} professions with additional organisations`,
  );

  console.log('Professions updated with additonal organisations:');

  const updatedProfessions = professionsWithAdditionalOrganisations.map(
    (profession) => [
      profession.name,
      profession.organisation.name,
      profession.additionalOrganisation.name,
    ],
  );

  console.table(updatedProfessions);

  await application.close();
  process.exit(0);
}

migrate();

import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';
import { Industry } from 'src/industries/industry.entity';
import {
  OtherCountriesRecognitionRoutes,
  Qualification,
} from 'src/qualifications/qualification.entity';
import { Legislation } from 'src/legislations/legislation.entity';
import { InjectData } from '../common/decorators/seeds.decorator';
import { Organisation } from '../organisations/organisation.entity';
import { OrganisationVersion } from '../organisations/organisation-version.entity';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
  RegulationType,
} from './profession-version.entity';

import { ProfessionsSearchService } from './professions-search.service';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from './profession-to-organisation.entity';
import { DecisionDataset } from '../decisions/decision-dataset.entity';

type SeedOrganisation = {
  name: string;
  role: OrganisationRole;
};

type SeedProfession = {
  name: string;
  slug: string;
  organisations: SeedOrganisation[];
  versions: SeedVersion[];
};

type SeedVersion = {
  alternateName: string;
  description: string;
  occupationLocations: string[];
  regulationType: RegulationType;
  registrationRequirements: string;
  registrationUrl: string;
  industries: string[];
  qualification: string;
  reservedActivities: string;
  protectedTitles: string;
  regulationUrl: string;
  legislations: string[];
  organisation: string;
  socCode: number;
  keywords: string;
  status: ProfessionVersionStatus;
  updated_at: string;
};

@Injectable()
export class ProfessionsSeeder implements Seeder {
  @InjectData('professions')
  data: SeedProfession[];

  constructor(
    @InjectRepository(Profession)
    private readonly professionsRepository: Repository<Profession>,
    @InjectRepository(ProfessionVersion)
    private readonly professionVersionsRepository: Repository<ProfessionVersion>,
    @InjectRepository(Industry)
    private readonly industriesRepository: Repository<Industry>,
    @InjectRepository(Qualification)
    private readonly qualificationsRepository: Repository<Qualification>,
    @InjectRepository(Legislation)
    private readonly legislationsRepository: Repository<Legislation>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationVersion)
    private readonly organisationVersionRepository: Repository<OrganisationVersion>,
    @InjectRepository(ProfessionToOrganisation)
    private readonly professionToOrganisationRepository: Repository<ProfessionToOrganisation>,
    @InjectRepository(DecisionDataset)
    private readonly decisionDatasetsRepository: Repository<DecisionDataset>,
    private readonly searchService: ProfessionsSearchService,
  ) {}

  async seed(): Promise<void> {
    await Promise.all(
      this.data.map(async (seedProfession) => {
        const existingProfession = await this.professionsRepository.findOneBy({
          slug: seedProfession.slug,
        });

        const newProfession = {
          name: seedProfession.name,
          slug: seedProfession.slug,
        } as Profession;

        const savedProfession = await this.professionsRepository.save({
          ...existingProfession,
          ...newProfession,
        });

        const professionToOrganisations = await Promise.all(
          seedProfession.organisations.map(async (seedOrganisation) => {
            const organisation = await this.organisationRepository.findOne({
              where: { name: seedOrganisation.name },
            });

            return new ProfessionToOrganisation(
              organisation,
              savedProfession,
              seedOrganisation.role,
            );
          }),
        );

        await this.professionToOrganisationRepository.save(
          professionToOrganisations,
        );

        const seededVersions = (
          await this.seedVersions(seedProfession, savedProfession)
        ).filter(Boolean);

        await this.professionVersionsRepository.save(seededVersions);

        const liveVersions = seededVersions.filter(
          (version) => version.status === ProfessionVersionStatus.Live,
        );

        for (const version of liveVersions) {
          await this.searchService.index(version);
        }
      }),
    );

    await this.qualificationsRepository.delete({ created_at: new Date(0) });
    await this.legislationsRepository.delete({ created_at: new Date(0) });
  }

  private async seedVersions(
    seedProfession: SeedProfession,
    savedProfession: Profession,
  ): Promise<ProfessionVersion[]> {
    return Promise.all(
      seedProfession.versions.map(async (version) => {
        const existingVersion = await this.professionVersionsRepository.findOneBy(
          {
            status: version.status,
            profession: savedProfession,
          },
        );

        const industries =
          version.industries &&
          (await this.industriesRepository.find({
            where: { name: In(version.industries || []) },
          }));

        // We use the created_at value to get a qualification seeded by our
        // qualification seeder that is unattached to a profession version
        let qualification: Qualification =
          version.qualification &&
          (await this.qualificationsRepository.findOne({
            where: {
              routesToObtain: version.qualification,
              created_at: new Date(0),
            },
          }));

        if (qualification) {
          qualification = await this.qualificationsRepository.save(
            new Qualification(
              qualification.routesToObtain,
              qualification.url,
              '',
              '',
              qualification.otherCountriesRecognitionRoutes as OtherCountriesRecognitionRoutes,
            ),
          );
        }

        // We use the created_at value to get a legislation seeded by our
        // legislation seeder that is unattached to a profession version
        let legislations: Legislation[] =
          version.legislations &&
          (await this.legislationsRepository.find({
            where: { name: In(version.legislations), created_at: new Date(0) },
          }));

        if (legislations && legislations.length > 0) {
          const newLegislations = legislations.map(
            (leg, index) => new Legislation(leg.name, leg.url, index),
          );
          legislations = await this.legislationsRepository.save(
            newLegislations,
          );
        }

        const newVersion = {
          alternateName: version.alternateName,
          description: version.description,
          occupationLocations: version.occupationLocations,
          regulationType: version.regulationType as RegulationType,
          registrationRequirements: version.registrationRequirements,
          registrationUrl: version.registrationUrl,
          reservedActivities: version.reservedActivities,
          protectedTitles: version.protectedTitles,
          regulationUrl: version.regulationUrl,
          industries: industries,
          legislations: legislations,
          qualification: qualification,
          status: version.status as ProfessionVersionStatus,
          profession: savedProfession,
          socCode: version.socCode,
          keywords: version.keywords,
          updated_at: version.updated_at && new Date(version.updated_at),
        } as ProfessionVersion;

        return { ...existingVersion, ...newVersion };
      }),
    );
  }

  async drop(): Promise<any> {
    // Handle deletion of dependent repositories here to prevent violation of
    // foreign key constraints
    await this.legislationsRepository.delete({});
    await this.professionVersionsRepository.delete({});
    await this.industriesRepository.delete({});
    await this.qualificationsRepository.delete({});
    await this.professionsRepository.delete({});
    await this.organisationVersionRepository.delete({});
    await this.organisationRepository.delete({});
    await this.decisionDatasetsRepository.delete({});
  }
}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Organisation } from '../organisations/organisation.entity';
import { OrganisationsSearchService } from '../organisations/organisations-search.service';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from '../organisations/organisation-version.entity';
import { InjectData } from '../common/decorators/seeds.decorator';

type SeedOrganisation = {
  name: string;
  slug: string;
  versions: SeedOrganisationVersion[];
};

type SeedOrganisationVersion = {
  alternateName: string;
  address: string;
  url: string;
  email: string;
  telephone: string;
  status: string;
  created_at: string;
};

@Injectable()
export class OrganisationsSeeder implements Seeder {
  @InjectData('organisations')
  data: SeedOrganisation[];

  constructor(
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>,
    @InjectRepository(OrganisationVersion)
    private readonly organisationVersionsRepository: Repository<OrganisationVersion>,
    private readonly searchService: OrganisationsSearchService,
  ) {}

  async seed(): Promise<any> {
    const organisations = await Promise.all(
      this.data.map(async (organisation) => {
        const existingOrganisation = await this.organisationsRepository.findOne(
          {
            slug: organisation.slug,
          },
        );

        const newOrganisation = {
          name: organisation.name,
          slug: organisation.slug,
        } as Organisation;

        return { ...existingOrganisation, ...newOrganisation };
      }),
    );

    await this.organisationsRepository.save(organisations);

    const versions = await Promise.all(
      organisations.map(async (org) => {
        const organisation = this.data.find((item) => item.slug === org.slug);
        const versions = await Promise.all(
          organisation.versions.map(async (item) => {
            const status = item.status as OrganisationVersionStatus;
            const existingVersion =
              await this.organisationVersionsRepository.findOne({
                organisation: org,
                status: status,
              });
            const newVersion = {
              alternateName: item.alternateName,
              address: item.address,
              url: item.url,
              email: item.email,
              telephone: item.telephone,
              organisation: org,
              status: status,
            } as OrganisationVersion;

            if (item.created_at) {
              newVersion.created_at = new Date(item.created_at);
            }

            return { ...existingVersion, ...newVersion };
          }),
        );

        return versions;
      }),
    );

    const flattenedVersions = versions.flat();

    await this.organisationVersionsRepository.save(flattenedVersions);

    for (const version of flattenedVersions) {
      await this.searchService.index(version);
    }
  }

  async drop(): Promise<any> {
    // Deletion of legislations is handled in `ProfessionsSeeder`
  }
}

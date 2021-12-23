import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Organisation } from '../organisations/organisation.entity';

type SeedOrganisation = {
  name: string;
  alternateName: string;
  address: string;
  url: string;
  email: string;
  contactUrl: string;
  telephone: string;
  fax: string;
};

@Injectable()
export class OrganisationsSeeder implements Seeder {
  constructor(
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const organisationsData =
      require('../../seeds/organisations.json') as SeedOrganisation[];

    const organisations = await Promise.all(
      organisationsData.map(async (organisation) => {
        return new Organisation(
          organisation.name,
          organisation.alternateName,
          organisation.address,
          organisation.url,
          organisation.email,
          organisation.contactUrl,
          organisation.telephone,
          organisation.fax,
          null,
        );
      }),
    );

    return this.organisationsRepository.save(organisations);
  }

  async drop(): Promise<any> {
    await this.organisationsRepository.delete({});
  }
}

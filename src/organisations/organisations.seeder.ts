import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Organisation } from '../organisations/organisation.entity';
import { InjectData } from '../common/decorators/seeds.decorator';

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
  @InjectData('organisations')
  data: SeedOrganisation[];

  constructor(
    @InjectRepository(Organisation)
    private readonly organisationsRepository: Repository<Organisation>,
  ) {}

  async seed(): Promise<any> {
    const organisations = await Promise.all(
      this.data.map(async (organisation) => {
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
    // Deletion of legislations is handled in `ProfessionsSeeder`
  }
}

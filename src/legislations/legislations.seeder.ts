import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Legislation } from './legislation.entity';

const environment = process.env['NODE_ENV'] || 'development';

type SeedLegislation = {
  name: string;
  url: string;
};

@Injectable()
export class LegislationsSeeder implements Seeder {
  constructor(
    @InjectRepository(Legislation)
    private readonly legislationsRepository: Repository<Legislation>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const userData =
      require(`../../seeds/${environment}/legislations.json`) as SeedLegislation[];

    const legislations = userData.map((legislation) => {
      return new Legislation(legislation.name, legislation.url);
    });

    return this.legislationsRepository.save(legislations);
  }

  async drop(): Promise<any> {
    // Deletion of legislations is handled in `ProfessionsSeeder`
  }
}

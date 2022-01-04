import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Industry } from './industry.entity';

const environment = process.env['NODE_ENV'] || 'development';

type SeedIndustry = {
  name: string;
};

@Injectable()
export class IndustriesSeeder implements Seeder {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const industryData =
      require(`../../seeds/${environment}/industries.json`) as SeedIndustry[];

    const industries = industryData.map((industry) => {
      return new Industry(industry.name);
    });

    return this.industryRepository.save(industries);
  }

  async drop(): Promise<any> {
    // Deletion of industries is handled in `ProfessionsSeeder`
  }
}

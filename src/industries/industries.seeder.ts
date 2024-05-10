import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectData } from '../common/decorators/seeds.decorator';

import { Industry } from './industry.entity';

type SeedIndustry = {
  name: string;
};

@Injectable()
export class IndustriesSeeder implements Seeder {
  @InjectData('industries')
  data: SeedIndustry[];

  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async seed(): Promise<any> {
    const industries = await Promise.all(
      this.data.map(async (industry) => {
        const existingIndustry = await this.industryRepository.findOne({
          where: {
            name: industry.name,
          },
        });

        if (existingIndustry) {
          return;
        }

        return new Industry(industry.name);
      }),
    );

    const definedIndustries = industries.filter((industry) => industry);

    return this.industryRepository.save(definedIndustries);
  }

  async drop(): Promise<any> {
    // Deletion of industries is handled in `ProfessionsSeeder`
  }
}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Industry } from './industry.entity';

@Injectable()
export class IndustriesSeeder implements Seeder {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const industryData = require('../../seeds/industries.json');

    const Industries: Array<Industry> = industryData.map(
      (industry: Industry) => {
        return new Industry(industry.name);
      },
    );

    return this.industryRepository.save(Industries);
  }

  async drop(): Promise<any> {
    return this.industryRepository.delete({});
  }
}

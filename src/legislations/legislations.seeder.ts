import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectData } from '../common/decorators/seeds.decorator';

import { Legislation } from './legislation.entity';

type SeedLegislation = {
  name: string;
  url: string;
};

@Injectable()
export class LegislationsSeeder implements Seeder {
  @InjectData('legislations')
  data: SeedLegislation[];

  constructor(
    @InjectRepository(Legislation)
    private readonly legislationsRepository: Repository<Legislation>,
  ) {}

  async seed(): Promise<any> {
    const legislations = this.data.map((legislation) => {
      return new Legislation(legislation.name, legislation.url);
    });

    return this.legislationsRepository.save(legislations);
  }

  async drop(): Promise<any> {
    // Deletion of legislations is handled in `ProfessionsSeeder`
  }
}

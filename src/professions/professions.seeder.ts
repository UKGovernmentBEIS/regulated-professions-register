import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';
import { Industry } from 'src/industries/industry.entity';
import { Qualification } from 'src/qualifications/qualification.entity';
import { Legislation } from 'src/legislations/legislation.entity';

type SeedProfession = {
  name: string;
  alternateName: string;
  description: string;
  occupationLocation: string;
  regulationType: string;
  industry: string;
  qualification: string;
  reservedActivities: string[];
  legislations: string[];
};

@Injectable()
export class ProfessionsSeeder implements Seeder {
  constructor(
    @InjectRepository(Profession)
    private readonly professionsRepository: Repository<Profession>,
    @InjectRepository(Industry)
    private readonly industriesRepository: Repository<Industry>,
    @InjectRepository(Qualification)
    private readonly qualificationsRepository: Repository<Qualification>,
    @InjectRepository(Legislation)
    private readonly legislationsRepository: Repository<Legislation>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const professionsData =
      require('../../seeds/professions.json') as SeedProfession[];

    const professions = await Promise.all(
      professionsData.map(async (profession) => {
        const industry = await this.industriesRepository.findOne({
          where: { name: profession.industry },
        });

        const qualification = await this.qualificationsRepository.findOne({
          where: { level: profession.qualification },
        });

        const legislations: Array<Legislation> = await Promise.all(
          profession.legislations.map(async (legislation) => {
            return this.legislationsRepository.findOne({
              where: { name: legislation },
            });
          }),
        );

        return new Profession(
          profession.name,
          profession.alternateName,
          profession.description,
          profession.occupationLocation,
          profession.regulationType,
          industry,
          qualification,
          profession.reservedActivities,
          legislations,
        );
      }),
    );

    return this.professionsRepository.save(professions);
  }

  async drop(): Promise<any> {
    // Handle deletion of dependent repositories here to prevent violation of
    // foreign key constraints
    await this.professionsRepository.delete({});
    await this.industriesRepository.delete({});
    await this.qualificationsRepository.delete({});
    await this.legislationsRepository.delete({});
  }
}

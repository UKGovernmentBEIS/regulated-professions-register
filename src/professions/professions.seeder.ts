import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Profession } from './profession.entity';
import { Industry } from 'src/industries/industry.entity';
import { Qualification } from 'src/qualifications/qualification.entity';
import { Legislation } from 'src/legislations/legislation.entity';

type SeedProfession = {
  name: string;
  alternateName: string;
  slug: string;
  description: string;
  occupationLocations: string[];
  regulationType: string;
  industries: string[];
  qualification: string;
  reservedActivities: string[];
  legislations: string[];
  confirmed: boolean;
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
        const industries = await this.industriesRepository.find({
          where: { name: In(profession.industries || []) },
        });

        const qualification = await this.qualificationsRepository.findOne({
          where: { level: profession.qualification },
        });

        const legislations: Array<Legislation> = await Promise.all(
          (profession.legislations || []).map(async (legislation) => {
            return this.legislationsRepository.findOne({
              where: { name: legislation },
            });
          }),
        );

        return new Profession(
          profession.name,
          profession.alternateName,
          profession.slug,
          profession.description,
          profession.occupationLocations,
          profession.regulationType,
          industries,
          qualification,
          profession.reservedActivities,
          legislations,
          profession.confirmed,
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

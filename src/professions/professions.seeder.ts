import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { MandatoryRegistration, Profession } from './profession.entity';
import { Industry } from 'src/industries/industry.entity';
import { Qualification } from 'src/qualifications/qualification.entity';
import { Legislation } from 'src/legislations/legislation.entity';
import { InjectData } from '../common/decorators/seeds.decorator';
import { Organisation } from '../organisations/organisation.entity';

type SeedProfession = {
  name: string;
  alternateName: string;
  slug: string;
  description: string;
  occupationLocations: string[];
  regulationType: string;
  industries: string[];
  qualification: string;
  reservedActivities: string;
  legislation: string;
  organisation: string;
  mandatoryRegistration: MandatoryRegistration;
  confirmed: boolean;
};

@Injectable()
export class ProfessionsSeeder implements Seeder {
  @InjectData('professions')
  data: SeedProfession[];

  constructor(
    @InjectRepository(Profession)
    private readonly professionsRepository: Repository<Profession>,
    @InjectRepository(Industry)
    private readonly industriesRepository: Repository<Industry>,
    @InjectRepository(Qualification)
    private readonly qualificationsRepository: Repository<Qualification>,
    @InjectRepository(Legislation)
    private readonly legislationsRepository: Repository<Legislation>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>,
  ) {}

  async seed(): Promise<any> {
    const professions = await Promise.all(
      this.data.map(async (profession) => {
        const industries = await this.industriesRepository.find({
          where: { name: In(profession.industries || []) },
        });

        const qualification = await this.qualificationsRepository.findOne({
          where: { level: profession.qualification },
        });

        let legislation: Legislation =
          await this.legislationsRepository.findOne({
            where: { name: profession.legislation },
          });

        if (legislation) {
          // Currently the Legislation relation has a unique constraint
          // on the legislationID, so we need to create a new Legislation
          // each time. We need to fix this, but in the interests of getting
          // seed data in, we'll just create a new entry each time
          legislation = await this.legislationsRepository.save(
            new Legislation(legislation.name, legislation.url),
          );
        }

        const organisation = await this.organisationRepository.findOne({
          where: { name: profession.organisation },
        });

        const existingProfession = await this.professionsRepository.findOne({
          slug: profession.slug,
        });

        const newProfession = new Profession(
          profession.name,
          profession.alternateName,
          profession.slug,
          profession.description,
          profession.occupationLocations,
          profession.regulationType,
          profession.mandatoryRegistration,
          industries,
          qualification,
          profession.reservedActivities,
          [],
          legislation,
          organisation,
          profession.confirmed,
        );

        return { ...existingProfession, ...newProfession };
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
    await this.organisationRepository.delete({});
  }
}

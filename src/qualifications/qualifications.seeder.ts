import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Qualification } from './qualification.entity';

type SeedQualification = {
  level: string;
  methodToObtain: string;
  commonPathToObtain: string;
  educationDuration: string;
  mandatoryProfessionalExperience: boolean;
};

@Injectable()
export class QualificationsSeeder implements Seeder {
  constructor(
    @InjectRepository(Qualification)
    private readonly qualificationsRepository: Repository<Qualification>,
  ) {}

  async seed(): Promise<any> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const userData =
      require('../../seeds/qualifications.json') as SeedQualification[];

    const qualifications = userData.map((qualification) => {
      return new Qualification(
        qualification.level,
        qualification.methodToObtain,
        qualification.commonPathToObtain,
        qualification.educationDuration,
        qualification.mandatoryProfessionalExperience,
      );
    });

    return this.qualificationsRepository.save(qualifications);
  }

  async drop(): Promise<any> {
    // Deletion of qualifications is handled in `ProfessionsSeeder`
  }
}

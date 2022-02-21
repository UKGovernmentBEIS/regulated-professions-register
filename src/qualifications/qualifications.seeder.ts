import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { Qualification } from './qualification.entity';
import { InjectData } from '../common/decorators/seeds.decorator';

type SeedQualification = {
  level: string;
  routesToObtain: string;
  mostCommonRouteToObtain: string;
  educationDuration: string;
  mandatoryProfessionalExperience: boolean;
};

@Injectable()
export class QualificationsSeeder implements Seeder {
  @InjectData('qualifications')
  data: SeedQualification[];

  constructor(
    @InjectRepository(Qualification)
    private readonly qualificationsRepository: Repository<Qualification>,
  ) {}

  async seed(): Promise<any> {
    const qualifications = this.data.map((qualification) => {
      return new Qualification(
        qualification.level,
        qualification.routesToObtain,
        qualification.mostCommonRouteToObtain,
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

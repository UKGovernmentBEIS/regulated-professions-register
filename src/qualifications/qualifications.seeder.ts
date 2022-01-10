import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';

import { MethodToObtain, Qualification } from './qualification.entity';
import { InjectData } from '../common/decorators/seeds.decorator';

type SeedQualification = {
  level: string;
  methodToObtain: MethodToObtain;
  otherMethodToObtain: string;
  commonPathToObtain: MethodToObtain;
  otherCommonPathToObtain: MethodToObtain;
  educationDuration: string;
  educationDurationYears: number;
  educationDurationMonths: number;
  educationDurationDays: number;
  educationDurationHours: number;
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
        qualification.methodToObtain as MethodToObtain,
        qualification.otherMethodToObtain,
        qualification.commonPathToObtain as MethodToObtain,
        qualification.otherCommonPathToObtain,
        qualification.educationDuration,
        qualification.educationDurationYears,
        qualification.educationDurationMonths,
        qualification.educationDurationDays,
        qualification.educationDurationHours,
        qualification.mandatoryProfessionalExperience,
      );
    });

    return this.qualificationsRepository.save(qualifications);
  }

  async drop(): Promise<any> {
    // Deletion of qualifications is handled in `ProfessionsSeeder`
  }
}

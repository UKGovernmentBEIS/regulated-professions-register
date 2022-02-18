import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MethodToObtain {
  GeneralSecondaryEducation = 'generalSecondaryEducation',
  GeneralOrVocationalPostSecondaryEducation = 'generalOrVocationalPostSecondaryEducation',
  GeneralPostSecondaryEducationMandatoryVocational = 'generalPostSecondaryEducationMandatoryVocational',
  VocationalPostSecondaryEducation = 'vocationalPostSecondaryEducation',
  DegreeLevel = 'degreeLevel',
  Others = 'others',
}

@Entity({ name: 'qualifications' })
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string;

  @Column({ type: 'enum', enum: MethodToObtain, nullable: true })
  methodToObtainDeprecated: MethodToObtain;

  @Column({ nullable: true })
  routesToObtain: string;

  @Column({ type: 'enum', enum: MethodToObtain, nullable: true })
  commonPathToObtainDeprecated: MethodToObtain;

  @Column({ nullable: true })
  mostCommonRouteToObtain: string;

  @Column()
  educationDuration: string;

  @Column({ nullable: true })
  educationDurationYears: number;

  @Column({ nullable: true })
  educationDurationMonths: number;

  @Column({ nullable: true })
  educationDurationDays: number;

  @Column({ nullable: true })
  educationDurationHours: number;

  @Column()
  mandatoryProfessionalExperience: boolean;

  @Column({ nullable: true })
  ukRecognition: string;

  @Column({ nullable: true })
  ukRecognitionUrl: string;

  @Column({ nullable: true })
  otherCountriesRecognition: string;

  @Column({ nullable: true })
  otherCountriesRecognitionUrl: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  constructor(
    level?: string,
    methodToObtain?: MethodToObtain,
    routesToObtain?: string,
    commonPathToObtain?: MethodToObtain,
    mostCommonRouteToObtain?: string,
    educationDuration?: string,
    educationDurationYears?: number,
    educationDurationMonths?: number,
    educationDurationDays?: number,
    educationDurationHours?: number,
    mandatoryProfessionalExperience?: boolean,
    ukRecognition?: string,
    ukRecognitionUrl?: string,
    otherCountriesRecognition?: string,
    otherCountriesRecognitionUrl?: string,
  ) {
    this.level = level || '';
    this.methodToObtainDeprecated = methodToObtain || undefined;
    this.commonPathToObtainDeprecated = commonPathToObtain || undefined;
    this.routesToObtain = routesToObtain || '';
    this.mostCommonRouteToObtain = mostCommonRouteToObtain || '';
    this.educationDuration = educationDuration || '';
    this.educationDurationYears = educationDurationYears || 0;
    this.educationDurationMonths = educationDurationMonths || 0;
    this.educationDurationDays = educationDurationDays || 0;
    this.educationDurationHours = educationDurationHours || 0;
    this.mandatoryProfessionalExperience =
      mandatoryProfessionalExperience || true;
    this.ukRecognition = ukRecognition || '';
    this.ukRecognitionUrl = ukRecognitionUrl || '';
    this.otherCountriesRecognition = otherCountriesRecognition || '';
    this.otherCountriesRecognitionUrl = otherCountriesRecognitionUrl || '';
  }
}

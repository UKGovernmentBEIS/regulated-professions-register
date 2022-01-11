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
  methodToObtain: MethodToObtain;

  @Column({ nullable: true })
  otherMethodToObtain: string;

  @Column({ type: 'enum', enum: MethodToObtain, nullable: true })
  commonPathToObtain: MethodToObtain;

  @Column({ nullable: true })
  otherCommonPathToObtain: string;

  @Column()
  educationDuration: string;

  @Column()
  educationDurationYears: number;

  @Column()
  educationDurationMonths: number;

  @Column()
  educationDurationDays: number;

  @Column()
  educationDurationHours: number;

  @Column()
  mandatoryProfessionalExperience: boolean;

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
    otherMethodToObtain?: string,
    commonPathToObtain?: MethodToObtain,
    otherCommonPathToObtain?: string,
    educationDuration?: string,
    educationDurationYears?: number,
    educationDurationMonths?: number,
    educationDurationDays?: number,
    educationDurationHours?: number,
    mandatoryProfessionalExperience?: boolean,
  ) {
    this.level = level || '';
    this.methodToObtain = methodToObtain || undefined;
    this.commonPathToObtain = commonPathToObtain || undefined;
    this.otherMethodToObtain = otherMethodToObtain || '';
    this.otherCommonPathToObtain = otherCommonPathToObtain || '';
    this.educationDuration = educationDuration || '';
    this.educationDurationYears = educationDurationYears || 0;
    this.educationDurationMonths = educationDurationMonths || 0;
    this.educationDurationDays = educationDurationDays || 0;
    this.educationDurationHours = educationDurationHours || 0;
    this.mandatoryProfessionalExperience =
      mandatoryProfessionalExperience || true;
  }
}

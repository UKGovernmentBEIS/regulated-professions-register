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

  @Column({ type: 'enum', enum: MethodToObtain })
  methodToObtain: MethodToObtain;

  @Column({ nullable: true })
  otherMethodToObtain: string;

  @Column({ type: 'enum', enum: MethodToObtain })
  commonPathToObtain: MethodToObtain;

  @Column({ nullable: true })
  otherCommonPathToObtain: string;

  @Column({ nullable: true })
  methodToObtainDeprecated: string;

  @Column({ nullable: true })
  commonPathToObtainDeprecated: string;

  @Column()
  educationDuration: string;

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
    mandatoryProfessionalExperience?: boolean,
  ) {
    this.level = level || '';
    this.methodToObtain = methodToObtain || undefined;
    this.commonPathToObtain = commonPathToObtain || undefined;
    this.otherMethodToObtain = otherMethodToObtain || '';
    this.otherCommonPathToObtain = otherCommonPathToObtain || '';
    this.educationDuration = educationDuration || '';
    this.mandatoryProfessionalExperience =
      mandatoryProfessionalExperience || true;
  }
}

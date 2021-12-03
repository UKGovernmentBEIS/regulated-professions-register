import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'qualifications' })
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: string;

  @Column()
  methodToObtain: string;

  @Column()
  commonPathToObtain: string;

  @Column()
  educationDuration: string;

  @Column()
  mandatoryProfessionalExperience: boolean;

  constructor(
    level?: string,
    methodToObtain?: string,
    commonPathToObtain?: string,
    educationDuration?: string,
    mandatoryProfessionalExperience?: boolean,
  ) {
    this.level = level || '';
    this.methodToObtain = methodToObtain || '';
    this.commonPathToObtain = commonPathToObtain || '';
    this.educationDuration = educationDuration || '';
    this.mandatoryProfessionalExperience =
      mandatoryProfessionalExperience || true;
  }
}

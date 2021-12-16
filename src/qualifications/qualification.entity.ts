import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

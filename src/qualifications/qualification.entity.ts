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

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  routesToObtain: string;

  @Column({ nullable: true })
  mostCommonRouteToObtain: string;

  @Column({ nullable: true })
  educationDuration: string;

  @Column({ nullable: true })
  mandatoryProfessionalExperience: boolean;

  @Column({ nullable: true })
  url: string;

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
    routesToObtain?: string,
    mostCommonRouteToObtain?: string,
    educationDuration?: string,
    mandatoryProfessionalExperience?: boolean,
    url?: string,
    ukRecognition?: string,
    ukRecognitionUrl?: string,
    otherCountriesRecognition?: string,
    otherCountriesRecognitionUrl?: string,
  ) {
    this.level = level || '';
    this.routesToObtain = routesToObtain || '';
    this.mostCommonRouteToObtain = mostCommonRouteToObtain || '';
    this.educationDuration = educationDuration || '';
    this.mandatoryProfessionalExperience =
      mandatoryProfessionalExperience || true;
    this.url = url || '';
    this.ukRecognition = ukRecognition || '';
    this.ukRecognitionUrl = ukRecognitionUrl || '';
    this.otherCountriesRecognition = otherCountriesRecognition || '';
    this.otherCountriesRecognitionUrl = otherCountriesRecognitionUrl || '';
  }
}

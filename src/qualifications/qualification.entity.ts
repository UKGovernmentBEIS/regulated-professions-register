import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OtherCountriesRecognitionRoutes {
  None = 'none',
  Some = 'some',
  All = 'all',
}

@Entity({ name: 'qualifications' })
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  routesToObtain: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  ukRecognition: string;

  @Column({ nullable: true })
  ukRecognitionUrl: string;

  @Column({ nullable: true })
  otherCountriesRecognitionSummary: string;

  @Column({ nullable: true })
  otherCountriesRecognitionUrl: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: OtherCountriesRecognitionRoutes,
  })
  otherCountriesRecognitionRoutes: OtherCountriesRecognitionRoutes;

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
    routesToObtain?: string,
    url?: string,
    ukRecognition?: string,
    ukRecognitionUrl?: string,
    otherCountriesRecognitionRoutes?: OtherCountriesRecognitionRoutes,
    otherCountriesRecognitionSummary?: string,
    otherCountriesRecognitionUrl?: string,
  ) {
    this.routesToObtain = routesToObtain || '';
    this.url = url || '';
    this.ukRecognition = ukRecognition || '';
    this.ukRecognitionUrl = ukRecognitionUrl || '';
    this.otherCountriesRecognitionRoutes =
      otherCountriesRecognitionRoutes || null;
    this.otherCountriesRecognitionSummary =
      otherCountriesRecognitionSummary || '';
    this.otherCountriesRecognitionUrl = otherCountriesRecognitionUrl || '';
  }
}

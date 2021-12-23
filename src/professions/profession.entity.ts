import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Organisation } from '../organisations/organisation.entity';

export enum MandatoryRegistration {
  Mandatory = 'mandatory',
  Voluntary = 'voluntary',
  Unknown = 'unknown',
}

@Entity({ name: 'professions' })
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  alternateName: string;

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true })
  occupationLocations: string[];

  @Column({ nullable: true })
  regulationType: string;

  @Column({ nullable: true, type: 'enum', enum: MandatoryRegistration })
  mandatoryRegistration: MandatoryRegistration;

  @ManyToMany(() => Industry, { nullable: true, eager: true })
  @JoinTable()
  industries: Industry[];

  @ManyToOne(() => Qualification, {
    eager: true,
  })
  qualification: Qualification;

  @Column('text', { array: true, nullable: true })
  reservedActivities: string[];

  @ManyToMany(() => Legislation, {
    eager: true,
  })
  @JoinTable()
  legislations: Legislation[];

  @ManyToOne(() => Organisation, (organisation) => organisation.professions, {
    eager: true,
  })
  organisation: Organisation;

  @Column({ default: false })
  confirmed: boolean;

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
    name?: string,
    alternateName?: string,
    slug?: string,
    description?: string,
    occupationLocations?: string[],
    regulationType?: string,
    mandatoryRegistration?: MandatoryRegistration,
    industries?: Industry[],
    qualification?: Qualification,
    reservedActivities?: string[],
    legislations?: Legislation[],
    organisation?: Organisation,
    confirmed?: boolean,
  ) {
    this.name = name || null;
    this.alternateName = alternateName || null;
    this.slug = slug || null;
    this.description = description || null;
    this.occupationLocations = occupationLocations || null;
    this.regulationType = regulationType || null;
    this.mandatoryRegistration = mandatoryRegistration || null;
    this.industries = industries || null;
    this.qualification = qualification || null;
    this.reservedActivities = reservedActivities || null;
    this.legislations = legislations || null;
    this.organisation = organisation || null;
    this.confirmed = confirmed || false;
  }
}

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
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Organisation } from '../organisations/organisation.entity';
import { ProfessionVersion } from './profession-version.entity';

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

  @OneToMany(
    () => ProfessionVersion,
    (professionVersion) => professionVersion.profession,
  )
  versions: ProfessionVersion[];

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

  @OneToOne(() => Qualification, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  qualification: Qualification;

  @Column({ nullable: true })
  reservedActivities: string;

  @OneToOne(() => Legislation, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  legislation: Legislation;

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
    reservedActivities?: string,
    legislations?: Legislation[],
    legislation?: Legislation,
    organisation?: Organisation,
    confirmed?: boolean,
    versions?: ProfessionVersion[],
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
    this.legislation = legislation || null;
    this.organisation = organisation || null;
    this.confirmed = confirmed || false;
    this.versions = versions || null;
  }
}

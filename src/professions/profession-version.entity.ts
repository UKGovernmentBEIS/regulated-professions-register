import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Legislation } from '../legislations/legislation.entity';
import { Organisation } from '../organisations/organisation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { User } from '../users/user.entity';
import { Profession } from './profession.entity';

export enum ProfessionVersionStatus {
  Live = 'live',
  Draft = 'draft',
  Archived = 'archived',
  Unconfirmed = 'unconfirmed',
}

export enum MandatoryRegistration {
  Mandatory = 'mandatory',
  Voluntary = 'voluntary',
  Unknown = 'unknown',
}

@Entity({ name: 'professionVersions' })
export class ProfessionVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profession, (profession) => profession.versions)
  profession: Profession;

  @ManyToOne(() => User, (user) => user.organisationVersions)
  user: User;

  @Column({
    type: 'enum',
    enum: ProfessionVersionStatus,
    default: ProfessionVersionStatus.Unconfirmed,
  })
  status: ProfessionVersionStatus;

  @Column({ nullable: true })
  alternateName: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true })
  occupationLocations: string[];

  @Column({ nullable: true })
  regulationType: string;

  @Column({ nullable: true, type: 'enum', enum: MandatoryRegistration })
  mandatoryRegistration: MandatoryRegistration;

  @Column({ nullable: true })
  reservedActivities: string;

  @ManyToMany(() => Industry, { nullable: true, eager: true })
  @JoinTable()
  industries: Industry[];

  @OneToMany(
    () => Qualification,
    (qualification) => qualification.professionVersion,
  )
  qualifications: Qualification[];

  @OneToMany(() => Legislation, (legislation) => legislation.professionVersion)
  legislations: Legislation[];

  @ManyToOne(() => Organisation, (organisation) => organisation.professions, {
    eager: true,
  })
  organisation: Organisation;

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
}

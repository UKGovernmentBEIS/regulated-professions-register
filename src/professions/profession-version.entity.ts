import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { User } from '../users/user.entity';
import { Profession } from './profession.entity';

export enum ProfessionVersionStatus {
  Live = 'live',
  Draft = 'draft',
  Archived = 'archived',
  Unconfirmed = 'unconfirmed',
}

export enum RegulationType {
  Licensing = 'licensing',
  Certification = 'certification',
  Accreditation = 'accreditation',
}

@Entity({ name: 'professionVersions' })
export class ProfessionVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profession, (profession) => profession.versions)
  profession: Profession;

  @ManyToOne(() => User, (user) => user.professionVersions)
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

  @Column({ type: 'enum', nullable: true, enum: RegulationType })
  regulationType: RegulationType;

  @Column({ nullable: true })
  registrationRequirements: string;

  @Column({ nullable: true })
  registrationUrl: string;

  @Column({ nullable: true })
  reservedActivities: string;

  @Column({ nullable: true })
  protectedTitles: string;

  @Column({ nullable: true })
  regulationUrl: string;

  @ManyToMany(() => Industry, { nullable: true, eager: true })
  @JoinTable()
  industries: Industry[];

  @OneToOne(() => Qualification, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  qualification: Qualification;

  @OneToMany(
    () => Legislation,
    (legislation) => legislation.professionVersion,
    { eager: true, cascade: true },
  )
  legislations: Legislation[];

  @Column({ nullable: true })
  keywords: string;

  @Column({ nullable: true })
  socCode: number;

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

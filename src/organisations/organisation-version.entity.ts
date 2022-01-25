import { Organisation } from './organisation.entity';
import { User } from '../users/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum OrganisationVersionStatus {
  Live = 'live',
  Draft = 'draft',
  Archived = 'archived',
  Unconfirmed = 'unconfirmed',
}

@Entity({ name: 'organisationVersions' })
export class OrganisationVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @ManyToOne(() => Organisation, (organisation) => organisation.versions)
  @JoinColumn()
  organisation: Organisation;

  @ManyToOne(() => User, (user) => user.organisationVersions)
  user: User;

  @Column({
    type: 'enum',
    enum: OrganisationVersionStatus,
    default: OrganisationVersionStatus.Unconfirmed,
  })
  status: OrganisationVersionStatus;

  @Column({ nullable: true })
  alternateName: string;

  @Column()
  address: string;

  @Column()
  url: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  contactUrl: string;

  @Column()
  telephone: string;

  @Column({ nullable: true })
  fax: string;

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

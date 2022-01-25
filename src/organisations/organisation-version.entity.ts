import { Organisation } from './organisation.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
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

  @OneToOne(() => Organisation, (organisation) => organisation.version)
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

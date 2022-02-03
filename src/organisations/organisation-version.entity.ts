import { Organisation } from './organisation.entity';
import { User } from '../users/user.entity';
import { OrganisationDto } from './admin/dto/organisation.dto';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  contactUrl: string;

  @Column({ nullable: true })
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

  static fromDto(dto: OrganisationDto): OrganisationVersion {
    return {
      alternateName: dto.alternateName,
      address: dto.address,
      url: dto.url,
      email: dto.email,
      contactUrl: dto.contactUrl,
      telephone: dto.telephone,
      fax: dto.fax,
    } as OrganisationVersion;
  }
}

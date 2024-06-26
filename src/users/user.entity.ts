import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrganisationVersion } from '../organisations/organisation-version.entity';
import { Role } from './role';
import { Organisation } from '../organisations/organisation.entity';
import { ProfessionVersion } from '../professions/profession-version.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Index({
    unique: true,
    where:
      '"externalIdentifier" IS NOT NULL AND "archived" = false AND "confirmed" = true',
  })
  @Column({ nullable: true })
  externalIdentifier: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Editor,
  })
  role: Role;

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

  @Column({ default: false })
  serviceOwner: boolean;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: false })
  archived: boolean;

  @OneToMany(
    () => OrganisationVersion,
    (organisationVersion) => organisationVersion.user,
    { eager: true },
  )
  organisationVersions: OrganisationVersion[];

  @OneToMany(
    () => ProfessionVersion,
    (professionVersion) => professionVersion.user,
    { eager: true },
  )
  professionVersions: ProfessionVersion[];

  @ManyToOne(() => Organisation, (organisation) => organisation.users, {
    eager: true,
  })
  @JoinColumn()
  organisation: Organisation;

  constructor(
    email?: string,
    name?: string,
    externalIdentifier?: string,
    role?: Role,
    serviceOwner?: boolean,
    confirmed?: boolean,
    organisationVersions?: OrganisationVersion[],
    organisation?: Organisation,
  ) {
    this.email = email || '';
    this.name = name || '';
    this.externalIdentifier = externalIdentifier || null;
    this.role = role || Role.Editor;
    this.serviceOwner = serviceOwner || false;
    this.confirmed = confirmed || false;
    this.organisationVersions = organisationVersions || null;
    this.organisation = organisation || null;
  }
}

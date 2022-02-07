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

export enum UserPermission {
  CreateUser = 'createUser',
  EditUser = 'editUser',
  DeleteUser = 'deleteUser',
  CreateOrganisation = 'createOrganisation',
  DeleteOrganisation = 'deleteOrganisation',
  CreateProfession = 'createProfession',
  DeleteProfession = 'deleteprofession',
  UploadDecisionData = 'uploadDecisionData',
  DownloadDecisionData = 'downloadDecisionData',
  ViewDecisionData = 'viewDecisionData',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Index({ unique: true, where: '"externalIdentifier" IS NOT NULL' })
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

  @OneToMany(
    () => OrganisationVersion,
    (organisationVersion) => organisationVersion.user,
  )
  organisationVersions: OrganisationVersion[];

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

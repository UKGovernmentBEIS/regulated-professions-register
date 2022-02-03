import { Profession } from '../professions/profession.entity';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity({ name: 'organisations' })
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @OneToMany(
    () => OrganisationVersion,
    (organisationVersion) => organisationVersion.organisation,
    { eager: true },
  )
  versions: OrganisationVersion[];

  @OneToMany(() => Profession, (profession) => profession.organisation)
  professions: Profession[];

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

  alternateName?: string;
  address?: string;
  url?: string;
  email?: string;
  contactUrl?: string;
  telephone?: string;
  fax?: string;
  versionId?: string;
  status?: OrganisationVersionStatus;

  public static withLatestLiveVersion(
    organisation: Organisation,
  ): Organisation {
    const liveVersions = organisation.versions
      .filter((v) => v.status == OrganisationVersionStatus.Live)
      .sort((a, b) => a.updated_at.getTime() - b.updated_at.getTime());

    const latestVersion = liveVersions[0];

    return Organisation.withVersion(organisation, latestVersion);
  }

  public static withVersion(
    organisation: Organisation,
    organisationVersion: OrganisationVersion,
  ): Organisation {
    return {
      ...organisation,
      alternateName: organisationVersion.alternateName,
      address: organisationVersion.address,
      url: organisationVersion.url,
      email: organisationVersion.email,
      contactUrl: organisationVersion.contactUrl,
      telephone: organisationVersion.telephone,
      fax: organisationVersion.fax,
      versionId: organisationVersion.id,
      status: organisationVersion.status,
    } as Organisation;
  }

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    address?: string,
    url?: string,
    email?: string,
    contactUrl?: string,
    telephone?: string,
    fax?: string,
    professions?: Profession[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.slug = slug || null;
    this.address = address || '';
    this.url = url || '';
    this.email = email || '';
    this.contactUrl = contactUrl || '';
    this.telephone = telephone || '';
    this.fax = fax;
    this.professions = professions;
  }
}

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
import { User } from '../users/user.entity';

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

  @OneToMany(() => User, (user) => user.organisation)
  users: User[];

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
  lastModified?: Date;
  changedByUser?: User;
  status?: OrganisationVersionStatus;

  public static withLatestLiveVersion(
    organisation: Organisation,
  ): Organisation {
    const liveVersions = Organisation.sortedVersions(organisation).filter(
      (v) => v.status == OrganisationVersionStatus.Live,
    );

    const latestVersion = liveVersions[0];

    return Organisation.withVersion(organisation, latestVersion);
  }

  public static withLatestVersion(organisation: Organisation): Organisation {
    const versions = Organisation.sortedVersions(organisation);

    return Organisation.withVersion(organisation, versions[0]);
  }

  private static sortedVersions(
    organisation: Organisation,
  ): OrganisationVersion[] {
    return organisation.versions.sort(
      (a: OrganisationVersion, b: OrganisationVersion) =>
        b.updated_at.getTime() - a.updated_at.getTime(),
    );
  }

  public static withVersion(
    organisation: Organisation,
    organisationVersion: OrganisationVersion,
    showDraftProfessions = false,
  ): Organisation {
    const professions = (organisation.professions || [])
      .map((profession) => {
        if (showDraftProfessions === true) {
          return Profession.withLatestLiveOrDraftVersion(profession);
        } else {
          return Profession.withLatestLiveVersion(profession);
        }
      })
      .filter(Boolean);

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
      lastModified: organisationVersion.updated_at,
      changedByUser: organisationVersion.user,
      professions: professions,
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
    users?: User[],
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
    this.users = users;
  }
}

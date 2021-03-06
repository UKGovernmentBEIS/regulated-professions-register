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
import { ProfessionToOrganisation } from '../professions/profession-to-organisation.entity';

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

  @OneToMany(
    () => ProfessionToOrganisation,
    (professionToOrganisation) => professionToOrganisation.organisation,
  )
  professionToOrganisations!: ProfessionToOrganisation[];

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
  telephone?: string;
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
  ): Organisation {
    return {
      ...organisation,
      alternateName: organisationVersion.alternateName,
      address: organisationVersion.address,
      url: organisationVersion.url,
      email: organisationVersion.email,
      telephone: organisationVersion.telephone,
      versionId: organisationVersion.id,
      status: organisationVersion.status,
      lastModified: organisationVersion.updated_at,
      changedByUser: organisationVersion.user,
    } as Organisation;
  }

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    address?: string,
    url?: string,
    email?: string,
    telephone?: string,
    users?: User[],
  ) {
    this.name = name || '';
    this.alternateName = alternateName || '';
    this.slug = slug || null;
    this.address = address || '';
    this.url = url || '';
    this.email = email || '';
    this.telephone = telephone || '';
    this.users = users;
  }
}

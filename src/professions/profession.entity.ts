import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { User } from '../users/user.entity';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
  RegulationType,
} from './profession-version.entity';
import { ProfessionToOrganisation } from './profession-to-organisation.entity';
import { sortProfessionVersionsByLastUpdated } from './helpers/sort-profession-versions-by-last-updated.helper';

@Entity({ name: 'professions' })
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(
    () => ProfessionToOrganisation,
    (professionToOrganisation) => professionToOrganisation.profession,
    { cascade: true },
  )
  professionToOrganisations!: ProfessionToOrganisation[];

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @OneToMany(
    () => ProfessionVersion,
    (professionVersion) => professionVersion.profession,
  )
  versions: ProfessionVersion[];

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
  description?: string;
  occupationLocations?: string[];
  regulationType?: RegulationType;
  registrationRequirements: string;
  registrationUrl: string;
  industries?: Industry[];
  qualification?: Qualification;
  protectedTitles?: string;
  regulationUrl?: string;
  reservedActivities?: string;
  legislations?: Legislation[];
  changedByUser?: User;
  versionId?: string;
  status?: ProfessionVersionStatus;
  lastModified?: Date;

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    description?: string,
    occupationLocations?: string[],
    regulationType?: RegulationType,
    registrationRequirements?: string,
    registrationUrl?: string,
    industries?: Industry[],
    qualification?: Qualification,
    reservedActivities?: string,
    legislations?: Legislation[],
    versions?: ProfessionVersion[],
  ) {
    this.name = name || null;
    this.alternateName = alternateName || null;
    this.slug = slug || null;
    this.description = description || null;
    this.occupationLocations = occupationLocations || null;
    this.regulationType = regulationType || null;
    this.registrationRequirements = registrationRequirements || null;
    this.registrationUrl = registrationUrl || null;
    this.industries = industries || null;
    this.qualification = qualification || null;
    this.reservedActivities = reservedActivities || null;
    this.legislations = legislations || null;
    this.versions = versions || null;
  }

  public static withLatestLiveVersion(
    profession: Profession,
  ): Profession | null {
    const liveVersions = sortProfessionVersionsByLastUpdated(
      profession.versions.filter(
        (v) => v.status === ProfessionVersionStatus.Live,
      ),
    );

    const latestVersion = liveVersions[0];

    if (!latestVersion) {
      return null;
    }

    return Profession.withVersion(profession, latestVersion);
  }

  public static withLatestLiveOrDraftVersion(
    profession: Profession,
  ): Profession | null {
    const draftAndLiveVersions = sortProfessionVersionsByLastUpdated(
      profession.versions.filter(
        (v) =>
          v.status === ProfessionVersionStatus.Live ||
          v.status === ProfessionVersionStatus.Draft,
      ),
    );

    const latestVersion = draftAndLiveVersions[0];

    if (!latestVersion) {
      return null;
    }

    return Profession.withVersion(profession, latestVersion);
  }

  static withVersion(
    profession: Profession,
    version: ProfessionVersion,
  ): Profession {
    return {
      ...profession,
      alternateName: version.alternateName,
      description: version.description,
      occupationLocations: version.occupationLocations,
      regulationType: version.regulationType,
      registrationRequirements: version.registrationRequirements,
      registrationUrl: version.registrationUrl,
      industries: version.industries,
      qualification: version.qualification,
      reservedActivities: version.reservedActivities,
      protectedTitles: version.protectedTitles,
      regulationUrl: version.regulationUrl,
      legislations: version.legislations,
      changedByUser: version.user,
      lastModified: version.updated_at,
      status: version.status,
      versionId: version.id,
    };
  }
}

import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Industry } from '../industries/industry.entity';
import { Organisation } from '../organisations/organisation.entity';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';

export enum MandatoryRegistration {
  Mandatory = 'mandatory',
  Voluntary = 'voluntary',
  Unknown = 'unknown',
}

@Entity({ name: 'professions' })
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @OneToMany(
    () => ProfessionVersion,
    (professionVersion) => professionVersion.profession,
  )
  versions: ProfessionVersion[];

  @Column({ nullable: true })
  alternateName: string;

  @Index({ unique: true, where: '"slug" IS NOT NULL' })
  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column('text', { array: true, nullable: true })
  occupationLocations: string[];

  @Column({ nullable: true })
  regulationType: string;

  @Column({ nullable: true, type: 'enum', enum: MandatoryRegistration })
  mandatoryRegistration: MandatoryRegistration;

  @ManyToMany(() => Industry, { nullable: true, eager: true })
  @JoinTable()
  industries: Industry[];

  @OneToOne(() => Qualification, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  qualification: Qualification;

  @Column({ nullable: true })
  reservedActivities: string;

  protectedTitles: string;

  regulationUrl: string;

  @OneToOne(() => Legislation, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  legislation: Legislation;

  @ManyToMany(() => Legislation, {
    eager: true,
  })
  @JoinTable()
  legislations: Legislation[];

  @ManyToOne(() => Organisation, (organisation) => organisation.professions, {
    eager: true,
  })
  organisation: Organisation;

  @Column({ default: false })
  confirmed: boolean;

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

  versionId?: string;
  status?: string;

  constructor(
    name?: string,
    alternateName?: string,
    slug?: string,
    description?: string,
    occupationLocations?: string[],
    regulationType?: string,
    mandatoryRegistration?: MandatoryRegistration,
    industries?: Industry[],
    qualification?: Qualification,
    reservedActivities?: string,
    legislations?: Legislation[],
    legislation?: Legislation,
    organisation?: Organisation,
    versions?: ProfessionVersion[],
  ) {
    this.name = name || null;
    this.alternateName = alternateName || null;
    this.slug = slug || null;
    this.description = description || null;
    this.occupationLocations = occupationLocations || null;
    this.regulationType = regulationType || null;
    this.mandatoryRegistration = mandatoryRegistration || null;
    this.industries = industries || null;
    this.qualification = qualification || null;
    this.reservedActivities = reservedActivities || null;
    this.legislations = legislations || null;
    this.legislation = legislation || null;
    this.organisation = organisation || null;
    this.versions = versions || null;
  }

  public static withLatestLiveVersion(
    profession: Profession,
  ): Profession | null {
    const liveVersions = profession.versions
      .filter((v) => v.status === ProfessionVersionStatus.Live)
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

    const latestVersion = liveVersions[0];

    if (!latestVersion) {
      return null;
    }

    return Profession.withVersion(profession, latestVersion);
  }

  public static withLatestLiveOrDraftVersion(
    profession: Profession,
  ): Profession | null {
    const draftAndLiveVersions = profession.versions
      .filter(
        (v) =>
          v.status === ProfessionVersionStatus.Live ||
          v.status === ProfessionVersionStatus.Draft,
      )
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

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
      mandatoryRegistration: version.mandatoryRegistration,
      industries: version.industries,
      qualification: version.qualification,
      reservedActivities: version.reservedActivities,
      protectedTitles: version.protectedTitles,
      regulationUrl: version.regulationUrl,
      legislations: version.legislations,
      status: version.status,
      versionId: version.id,
    };
  }
}

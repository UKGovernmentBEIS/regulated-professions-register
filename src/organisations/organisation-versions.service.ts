import {
  Repository,
  In,
  SelectQueryBuilder,
  Connection,
  Not,
  Any,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';
import { OrganisationsSearchService } from './organisations-search.service';
import { User } from '../users/user.entity';
import { ProfessionVersionStatus } from '../professions/profession-version.entity';
import { FilterInput } from '../common/interfaces/filter-input.interface';

@Injectable()
export class OrganisationVersionsService {
  constructor(
    @InjectRepository(OrganisationVersion)
    private repository: Repository<OrganisationVersion>,
    private organisationsSearchService: OrganisationsSearchService,
    private connection: Connection,
  ) {}

  async save(organisation: OrganisationVersion): Promise<OrganisationVersion> {
    return this.repository.save(organisation);
  }

  async find(id: string): Promise<OrganisationVersion> {
    return this.repository.findOne(id);
  }

  async all(): Promise<OrganisationVersion[]> {
    return await this.versionsWithJoins().getMany();
  }

  async create(
    previousVersion: OrganisationVersion,
    user: User,
  ): Promise<OrganisationVersion> {
    const newVersion = {
      ...previousVersion,
      id: undefined,
      user: user,
      created_at: undefined,
      updated_at: undefined,
      status: undefined,
    } as OrganisationVersion;

    return this.save(newVersion);
  }

  async findByIdWithOrganisation(
    organisationId: string,
    id: string,
  ): Promise<OrganisationVersion> {
    const version = await this.versionsWithJoins()
      .where({ organisation: { id: organisationId }, id })
      .getOne();

    return version;
  }

  async findLatestForOrganisationId(
    organisationId: string,
  ): Promise<OrganisationVersion> {
    return this.repository.findOne({
      where: {
        organisation: { id: organisationId },
        status: In([
          OrganisationVersionStatus.Draft,
          OrganisationVersionStatus.Live,
        ]),
      },
      order: { created_at: 'DESC' },
      relations: ['organisation'],
    });
  }

  async allLive(): Promise<Organisation[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn(['organisation.name', 'organisation'])
      .where('organisationVersion.status = :status', {
        status: OrganisationVersionStatus.Live,
      })
      .orderBy('organisation.name, organisation')
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }

  async allLiveOrDraft(): Promise<Organisation[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn(['organisation.name', 'organisation'])
      .where('organisationVersion.status IN(:...status)', {
        status: [
          OrganisationVersionStatus.Live,
          OrganisationVersionStatus.Draft,
        ],
      })
      .orderBy('organisation.name, organisation')
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }

  async searchLive(filter: FilterInput): Promise<Organisation[]> {
    const query = this.versionsWithJoins([ProfessionVersionStatus.Live])
      .distinctOn(['organisation.name, organisation, profession'])
      .orderBy('organisation.name, organisation, profession')
      .where('organisationVersion.status = :status', {
        status: OrganisationVersionStatus.Live,
      });

    return await this.filter(query, filter);
  }

  async searchWithLatestVersion(filter: FilterInput): Promise<Organisation[]> {
    const query = this.versionsWithJoins([
      ProfessionVersionStatus.Live,
      ProfessionVersionStatus.Draft,
    ])
      .distinctOn([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ])
      .where('organisationVersion.status IN(:...organisationStatus)', {
        organisationStatus: [
          OrganisationVersionStatus.Live,
          OrganisationVersionStatus.Draft,
          OrganisationVersionStatus.Archived,
        ],
      })
      .orderBy(
        'organisation.name, organisationVersion.organisation, profession.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      );

    return await this.filter(query, filter);
  }

  async allWithLatestVersion(): Promise<Organisation[]> {
    const versions = await this.versionsWithJoins([
      ProfessionVersionStatus.Live,
      ProfessionVersionStatus.Draft,
    ])
      .distinctOn([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ])
      .where('organisationVersion.status IN(:...organisationStatus)', {
        organisationStatus: [
          OrganisationVersionStatus.Live,
          OrganisationVersionStatus.Draft,
          OrganisationVersionStatus.Archived,
        ],
      })
      .orderBy(
        'organisation.name, organisationVersion.organisation, profession.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      )
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }

  async findLiveBySlug(slug: string): Promise<Organisation> {
    const version = await this.versionsWithJoins()
      .where(
        'organisationVersion.status = :status AND organisation.slug = :slug',
        {
          status: OrganisationVersionStatus.Live,
          slug: slug,
        },
      )
      .getOne();

    return Organisation.withVersion(version.organisation, version);
  }

  async hasLiveVersion(organisation: Organisation): Promise<boolean> {
    return (
      (await this.repository
        .createQueryBuilder('organisationVersion')
        .leftJoinAndSelect('organisationVersion.organisation', 'organisation')
        .where(
          'organisationVersion.status = :status AND organisation.id = :id',
          {
            status: OrganisationVersionStatus.Live,
            id: organisation.id,
          },
        )
        .getCount()) > 0
    );
  }

  async confirm(version: OrganisationVersion): Promise<OrganisationVersion> {
    version.status = OrganisationVersionStatus.Draft;

    await this.organisationsSearchService.index(version);

    return this.repository.save(version);
  }

  async publish(version: OrganisationVersion): Promise<OrganisationVersion> {
    const queryRunner = this.connection.createQueryRunner();
    const organisation = version.organisation;

    const liveVersion = await this.repository.findOne({
      organisation,
      status: OrganisationVersionStatus.Live,
    });

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (liveVersion) {
        liveVersion.status = OrganisationVersionStatus.Archived;
        await this.repository.save(liveVersion);
      }

      version.status = OrganisationVersionStatus.Live;
      await this.repository.save(version);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    await this.organisationsSearchService.index(version);

    return version;
  }

  async archive(version: OrganisationVersion): Promise<OrganisationVersion> {
    const queryRunner = this.connection.createQueryRunner();
    const organisation = version.organisation;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const liveAndDraftVersions = await this.repository.find({
        where: {
          organisation,
          id: Not(version.id),
          status: Any([
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
          ]),
        },
      });

      if (liveAndDraftVersions.length) {
        liveAndDraftVersions.forEach(
          (version) => (version.status = OrganisationVersionStatus.Archived),
        );
        await this.repository.save(liveAndDraftVersions);
      }

      version.status = OrganisationVersionStatus.Archived;
      await this.repository.save(version);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return version;
  }

  async unarchive(version: OrganisationVersion): Promise<OrganisationVersion> {
    version.status = OrganisationVersionStatus.Draft;
    return await this.repository.save(version);
  }

  private versionsWithJoins(
    professionVersionStatuses: ProfessionVersionStatus[] = undefined,
  ): SelectQueryBuilder<OrganisationVersion> {
    const professionVersionCondition = professionVersionStatuses
      ? professionVersionStatuses
          .map((status) => `professionVersions.status = '${status}'`)
          .join(' OR ')
      : undefined;

    return this.repository
      .createQueryBuilder('organisationVersion')
      .leftJoinAndSelect('organisationVersion.organisation', 'organisation')
      .leftJoinAndSelect('organisationVersion.user', 'user')
      .leftJoinAndSelect(
        'organisation.professionToOrganisations',
        'professionToOrganisation',
      )
      .leftJoinAndSelect('professionToOrganisation.profession', 'profession')
      .leftJoinAndSelect(
        'profession.versions',
        'professionVersions',
        professionVersionCondition,
      )
      .leftJoinAndSelect('professionVersions.industries', 'industries');
  }

  private async filter(
    query: SelectQueryBuilder<OrganisationVersion>,
    filter: FilterInput,
  ): Promise<Organisation[]> {
    if (filter.keywords?.length) {
      const ids = await this.organisationsSearchService.search(filter.keywords);
      query = query.andWhere({ id: In(ids) });
    }

    if (filter.nations?.length) {
      const nations = filter.nations.map((n) => n.code);

      query = query.andWhere(
        'professionVersions.occupationLocations && :nations',
        {
          nations: nations,
        },
      );
    }

    if (filter.industries?.length) {
      const industries = filter.industries.map((i) => i.id);

      query = query.andWhere('industries.id IN(:...industries)', {
        industries: industries,
      });
    }

    if (filter.organisations?.length) {
      const organisations = filter.organisations.map((o) => o.id);

      query = query.andWhere('organisation.id IN(:...organisations)', {
        organisations: organisations,
      });
    }

    if (filter.regulationTypes?.length) {
      query = query.andWhere(
        'professionVersions.regulationType IN(:...regulationTypes)',
        {
          regulationTypes: filter.regulationTypes,
        },
      );
    }

    const versions = await query.getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }
}

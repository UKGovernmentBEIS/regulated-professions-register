import { Repository, In, SelectQueryBuilder, Connection } from 'typeorm';
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

import { ProfessionVersionsService } from '../professions/profession-versions.service';
@Injectable()
export class OrganisationVersionsService {
  constructor(
    @InjectRepository(OrganisationVersion)
    private repository: Repository<OrganisationVersion>,
    private professionVersionsService: ProfessionVersionsService,
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
      .where('organisationVersion.status = :status', {
        status: OrganisationVersionStatus.Live,
      })
      .orderBy('organisation.name')
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version),
    );
  }

  async searchLive(filter: FilterInput): Promise<Organisation[]> {
    const query = this.versionsWithJoins()
      .orderBy('organisation.name')
      .where('organisationVersion.status = :status', {
        status: OrganisationVersionStatus.Live,
      });

    return await this.filter(query, filter);
  }

  async allLiveAndDraft(): Promise<Organisation[]> {
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

  async searchWithLatestVersion(filter: FilterInput): Promise<Organisation[]> {
    const query = this.versionsWithJoins()
      .distinctOn([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ])
      .where(
        '(organisationVersion.status IN(:...organisationStatus)) AND (professionVersions.status IN(:...professionStatus) OR professionVersions.status IS NULL)',
        {
          organisationStatus: [
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
            OrganisationVersionStatus.Archived,
          ],
          professionStatus: [
            ProfessionVersionStatus.Live,
            ProfessionVersionStatus.Draft,
          ],
        },
      )
      .orderBy(
        'organisation.name, organisationVersion.organisation, profession.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      );

    return await this.filter(query, filter);
  }

  async allWithLatestVersion(): Promise<Organisation[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ])
      .where(
        '(organisationVersion.status IN(:...organisationStatus)) AND (professionVersions.status IN(:...professionStatus) OR professionVersions.status IS NULL)',
        {
          organisationStatus: [
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
            OrganisationVersionStatus.Archived,
          ],
          professionStatus: [
            ProfessionVersionStatus.Live,
            ProfessionVersionStatus.Draft,
          ],
        },
      )
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

  async archive(
    version: OrganisationVersion,
    user: User,
  ): Promise<OrganisationVersion> {
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
        liveVersion.status = OrganisationVersionStatus.Draft;
        await this.repository.save(liveVersion);
      }

      for (const professionToOrganisation of version.organisation
        .professionToOrganisations) {
        const profession = professionToOrganisation.profession;
        const professionVersion =
          await this.professionVersionsService.latestVersion(profession);

        if (professionVersion) {
          const professionVersionToBeArchived =
            await this.professionVersionsService.create(
              professionVersion,
              user,
            );

          await this.professionVersionsService.archive(
            professionVersionToBeArchived,
          );
        }
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

  private versionsWithJoins(): SelectQueryBuilder<OrganisationVersion> {
    return this.repository
      .createQueryBuilder('organisationVersion')
      .leftJoinAndSelect('organisationVersion.organisation', 'organisation')
      .leftJoinAndSelect('organisationVersion.user', 'user')
      .leftJoinAndSelect(
        'organisation.professionToOrganisations',
        'professionToOrganisation',
      )
      .leftJoinAndSelect('professionToOrganisation.profession', 'profession')
      .leftJoinAndSelect('profession.versions', 'professionVersions')
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
        'professionVersions.occupationLocations @> :nations',
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

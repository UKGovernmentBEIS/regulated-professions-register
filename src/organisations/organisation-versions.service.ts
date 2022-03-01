import { Repository, In, SelectQueryBuilder, Connection } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';
import { User } from '../users/user.entity';
import { ProfessionVersionStatus } from '../professions/profession-version.entity';

import { ProfessionVersionsService } from '../professions/profession-versions.service';
@Injectable()
export class OrganisationVersionsService {
  constructor(
    @InjectRepository(OrganisationVersion)
    private repository: Repository<OrganisationVersion>,
    private professionVersionsService: ProfessionVersionsService,
    private connection: Connection,
  ) {}

  async save(organisation: OrganisationVersion): Promise<OrganisationVersion> {
    return this.repository.save(organisation);
  }

  async find(id: string): Promise<OrganisationVersion> {
    return this.repository.findOne(id);
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

  async allWithLatestVersion(): Promise<Organisation[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn(['organisationVersion.organisation', 'professions.id'])
      .where('organisationVersion.status IN(:...status)', {
        status: [
          OrganisationVersionStatus.Live,
          OrganisationVersionStatus.Draft,
          OrganisationVersionStatus.Archived,
        ],
      })
      .where(
        'professionVersions.status IN(:...status) OR professionVersions.status IS NULL',
        {
          status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
        },
      )
      .orderBy(
        'organisationVersion.organisation, professions.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      )
      .getMany();

    return versions.map((version) =>
      Organisation.withVersion(version.organisation, version, true),
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

  async confirm(version: OrganisationVersion): Promise<OrganisationVersion> {
    version.status = OrganisationVersionStatus.Draft;

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

      for (const profession of version.organisation.professions) {
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
      .leftJoinAndSelect('organisation.professions', 'professions')
      .leftJoinAndSelect('professions.versions', 'professionVersions')
      .leftJoinAndSelect('professionVersions.industries', 'industries');
  }
}

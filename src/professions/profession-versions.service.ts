import { Connection, In, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';
import { ProfessionsSearchService } from './professions-search.service';
import { Profession } from './profession.entity';
import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { User } from '../users/user.entity';
import { FilterInput } from '../common/interfaces/filter-input.interface';
import { Organisation } from '../organisations/organisation.entity';
import { sortProfessionVersionsByStatus } from './helpers/sort-profession-versions-by-status.helper';
import { sortProfessionVersionsByLastUpdated } from './helpers/sort-profession-versions-by-last-updated.helper';

export type ProfessionSortMethod = 'name' | 'last-updated' | 'status';

@Injectable()
export class ProfessionVersionsService {
  constructor(
    @InjectRepository(ProfessionVersion)
    private repository: Repository<ProfessionVersion>,
    private connection: Connection,
    private readonly searchService: ProfessionsSearchService,
  ) {}

  async save(professionVersion: ProfessionVersion): Promise<ProfessionVersion> {
    return this.repository.save(professionVersion);
  }

  async find(id: string): Promise<ProfessionVersion> {
    return this.repository.findOne({ where: { id: id } });
  }

  async findWithProfession(id: string): Promise<ProfessionVersion> {
    return this.repository.findOne({
      where: { id: id },
      relations: ['profession'],
    });
  }

  async confirm(version: ProfessionVersion): Promise<ProfessionVersion> {
    version.status = ProfessionVersionStatus.Draft;

    return this.repository.save(version);
  }

  async create(
    previousVersion: ProfessionVersion,
    user: User,
  ): Promise<ProfessionVersion> {
    const newQualification =
      previousVersion.qualification &&
      ({
        ...previousVersion.qualification,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      } as Qualification);

    const newLegislations = previousVersion.legislations.map((legislation) => {
      return {
        ...legislation,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      } as Legislation;
    });

    const newVersion = {
      ...previousVersion,
      id: undefined,
      status: undefined,
      created_at: undefined,
      updated_at: undefined,
      user: user,
      qualification: newQualification,
      legislations: newLegislations,
    } as ProfessionVersion;

    return this.save(newVersion);
  }

  async publish(version: ProfessionVersion): Promise<ProfessionVersion> {
    const queryRunner = this.connection.createQueryRunner();
    const profession = version.profession;

    const liveVersion = await this.repository.findOne({
      where: {
        profession: {
          id: profession.id,
        },
        status: ProfessionVersionStatus.Live,
      },
    });

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (liveVersion) {
        liveVersion.status = ProfessionVersionStatus.Archived;
        await this.repository.save(liveVersion);
        await this.searchService.delete(liveVersion);
      }

      version.status = ProfessionVersionStatus.Live;
      await this.repository.save(version);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    await this.searchService.index(version);

    return version;
  }

  async archive(version: ProfessionVersion): Promise<ProfessionVersion> {
    const queryRunner = this.connection.createQueryRunner();
    const profession = version.profession;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const liveAndDraftVersions = await this.repository.find({
        where: {
          profession: {
            id: profession.id,
          },
          id: Not(version.id),
          status: In([
            ProfessionVersionStatus.Live,
            ProfessionVersionStatus.Draft,
          ]),
        },
      });

      if (liveAndDraftVersions.length) {
        liveAndDraftVersions.forEach(
          (version) => (version.status = ProfessionVersionStatus.Archived),
        );
        await this.repository.save(liveAndDraftVersions);
      }

      version.status = ProfessionVersionStatus.Archived;
      await this.repository.save(version);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    const versions = await this.repository.find({
      where: {
        profession: {
          id: profession.id,
        },
      },
    });

    await this.searchService.bulkDelete(versions);

    return version;
  }

  async findLatestForProfessionId(
    professionId: string,
  ): Promise<ProfessionVersion> {
    return this.repository.findOne({
      where: {
        profession: { id: professionId },
        status: In([
          ProfessionVersionStatus.Draft,
          ProfessionVersionStatus.Live,
        ]),
      },
      order: { created_at: 'DESC' },
      relations: [
        'profession',
        'profession.professionToOrganisations',
        'profession.professionToOrganisations.organisation',
      ],
    });
  }

  async searchLive(filter: FilterInput): Promise<Profession[]> {
    let query = this.versionsWithJoins()
      .orderBy('profession.name')
      .where('professionVersion.status = :status', {
        status: ProfessionVersionStatus.Live,
      });

    if (filter.keywords?.length) {
      const ids = await this.searchService.search(filter.keywords);
      query = query.andWhere({ id: In(ids) });
    }

    if (filter.nations?.length) {
      const nations = filter.nations.map((n) => n.code);

      query = query.andWhere(
        'professionVersion.occupationLocations && :nations',
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

    if (filter.regulationTypes?.length) {
      query = query.andWhere(
        'professionVersion.regulationType IN(:...regulationTypes)',
        {
          regulationTypes: filter.regulationTypes,
        },
      );
    }

    const versions = await query.getMany();

    return versions.map((version) =>
      Profession.withVersion(version.profession, version),
    );
  }

  async allLive(): Promise<ProfessionVersion[]> {
    return await this.versionsWithJoins()
      .where('professionVersion.status = :status', {
        status: ProfessionVersionStatus.Live,
      })
      .orderBy('profession.name')
      .getMany();
  }

  async allLiveForOrganisation(
    organisation: Organisation,
  ): Promise<ProfessionVersion[]> {
    return await this.versionsWithJoins()
      .where('professionVersion.status = :status', {
        status: ProfessionVersionStatus.Live,
      })
      .andWhere('organisation.id = :organisationId', {
        organisationId: organisation.id,
      })
      .orderBy('profession.name')
      .getMany();
  }

  async allWithLatestVersion(
    sortMethod: ProfessionSortMethod,
  ): Promise<Profession[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn([
        'professionVersion.profession',
        'organisation.name',
        'profession.name',
      ])
      .where('professionVersion.status IN(:...status)', {
        status: [
          ProfessionVersionStatus.Live,
          ProfessionVersionStatus.Draft,
          ProfessionVersionStatus.Archived,
        ],
      })
      .orderBy(
        'profession.name, organisation.name, professionVersion.profession, professionVersion.created_at',
        'DESC',
      )
      .getMany();

    const sortedVersions =
      sortMethod === 'name'
        ? versions
        : sortMethod === 'status'
          ? sortProfessionVersionsByStatus(versions)
          : sortProfessionVersionsByLastUpdated(versions);

    return sortedVersions.map((version) =>
      Profession.withVersion(version.profession, version),
    );
  }

  async allWithLatestVersionForOrganisation(
    organisation: Organisation,
  ): Promise<Profession[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn([
        'professionVersion.profession',
        'organisation.name',
        'profession.name',
      ])
      .where('professionVersion.status IN(:...status)', {
        status: [
          ProfessionVersionStatus.Live,
          ProfessionVersionStatus.Draft,
          ProfessionVersionStatus.Archived,
        ],
      })
      .andWhere('organisation.id = :organisationId', {
        organisationId: organisation.id,
      })
      .orderBy(
        'profession.name, organisation.name, professionVersion.profession, professionVersion.created_at',
        'DESC',
      )
      .getMany();

    return versions.map((version) =>
      Profession.withVersion(version.profession, version),
    );
  }

  async latestVersion(profession: Profession): Promise<ProfessionVersion> {
    return await this.versionsWithJoins()
      .distinctOn(['professionVersion.profession', 'profession.name'])
      .where('professionVersion.status IN(:...status)', {
        status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
      })
      .where({ profession: profession })
      .orderBy(
        'profession.name, professionVersion.profession, professionVersion.created_at',
        'DESC',
      )
      .getOne();
  }

  async findLiveBySlug(slug: string): Promise<Profession> {
    const version = await this.versionsWithJoins()
      .leftJoinAndSelect('organisation.versions', 'organisationVersions')
      .where('professionVersion.status = :status AND profession.slug = :slug', {
        status: ProfessionVersionStatus.Live,
        slug: slug,
      })
      .getOne();

    return Profession.withVersion(version.profession, version);
  }

  async hasLiveVersion(profession: Profession): Promise<boolean> {
    return (
      (await this.repository
        .createQueryBuilder('professionVersion')
        .leftJoinAndSelect('professionVersion.profession', 'profession')
        .where('professionVersion.status = :status AND profession.id = :id', {
          status: ProfessionVersionStatus.Live,
          id: profession.id,
        })
        .getCount()) > 0
    );
  }

  async findByIdWithProfession(
    professionId: string,
    id: string,
  ): Promise<ProfessionVersion> {
    const version = await this.versionsWithJoins()
      .leftJoinAndSelect('organisation.versions', 'organisationVersions')
      .where({ profession: { id: professionId }, id })
      .getOne();

    return version;
  }

  private versionsWithJoins(): SelectQueryBuilder<ProfessionVersion> {
    return this.repository
      .createQueryBuilder('professionVersion')
      .leftJoinAndSelect('professionVersion.profession', 'profession')
      .leftJoinAndSelect(
        'profession.professionToOrganisations',
        'professionToOrganisations',
      )
      .leftJoinAndSelect(
        'professionToOrganisations.organisation',
        'organisation',
      )
      .leftJoinAndSelect('professionVersion.industries', 'industries')
      .leftJoinAndSelect('professionVersion.qualification', 'qualification')
      .leftJoinAndSelect('professionVersion.user', 'user')
      .leftJoinAndSelect('professionVersion.legislations', 'legislations');
  }
}

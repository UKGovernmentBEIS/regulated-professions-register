import { Connection, In, Repository, SelectQueryBuilder } from 'typeorm';
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
    return this.repository.findOne(id);
  }

  async findWithProfession(id: string): Promise<ProfessionVersion> {
    return this.repository.findOne(id, { relations: ['profession'] });
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
      profession,
      status: ProfessionVersionStatus.Live,
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

    const liveVersion = await this.repository.findOne({
      profession,
      status: ProfessionVersionStatus.Live,
    });

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (liveVersion) {
        liveVersion.status = ProfessionVersionStatus.Draft;
        await this.repository.save(liveVersion);
      }

      version.status = ProfessionVersionStatus.Archived;
      await this.repository.save(version);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

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
      relations: ['profession'],
    });
  }

  async allLive(): Promise<Profession[]> {
    const versions = await this.versionsWithJoins()
      .where('professionVersion.status = :status', {
        status: ProfessionVersionStatus.Live,
      })
      .getMany();

    return versions.map((version) =>
      Profession.withVersion(version.profession, version),
    );
  }

  async allWithLatestVersion(): Promise<Profession[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn(['professionVersion.profession'])
      .where('professionVersion.status IN(:...status)', {
        status: [
          ProfessionVersionStatus.Live,
          ProfessionVersionStatus.Draft,
          ProfessionVersionStatus.Archived,
        ],
      })
      .orderBy(
        'professionVersion.profession, professionVersion.created_at',
        'DESC',
      )
      .getMany();

    return versions.map((version) =>
      Profession.withVersion(version.profession, version),
    );
  }

  async latestVersion(profession: Profession): Promise<ProfessionVersion> {
    return await this.versionsWithJoins()
      .distinctOn(['professionVersion.profession'])
      .where('professionVersion.status IN(:...status)', {
        status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
      })
      .where({ profession: profession })
      .orderBy(
        'professionVersion.profession, professionVersion.created_at',
        'DESC',
      )
      .getOne();
  }

  async findLiveBySlug(slug: string): Promise<Profession> {
    const version = await this.versionsWithJoins()
      .leftJoinAndSelect('organisation.versions', 'organisationVersions')
      .leftJoinAndSelect(
        'additionalOrganisation.versions',
        'additionalOrganisationVersions',
      )
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
      .leftJoinAndSelect(
        'additionalOrganisation.versions',
        'additionalOrganisationVersions',
      )
      .where({ profession: { id: professionId }, id })
      .getOne();

    return version;
  }

  private versionsWithJoins(): SelectQueryBuilder<ProfessionVersion> {
    return this.repository
      .createQueryBuilder('professionVersion')
      .leftJoinAndSelect('professionVersion.profession', 'profession')
      .leftJoinAndSelect('profession.organisation', 'organisation')
      .leftJoinAndSelect(
        'profession.additionalOrganisation',
        'additionalOrganisation',
      )
      .leftJoinAndSelect('professionVersion.industries', 'industries')
      .leftJoinAndSelect('professionVersion.qualification', 'qualification')
      .leftJoinAndSelect('professionVersion.user', 'user')
      .leftJoinAndSelect('professionVersion.legislations', 'legislations');
  }
}

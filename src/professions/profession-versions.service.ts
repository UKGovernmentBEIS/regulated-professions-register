import { Connection, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';
import { Profession } from './profession.entity';

@Injectable()
export class ProfessionVersionsService {
  constructor(
    @InjectRepository(ProfessionVersion)
    private repository: Repository<ProfessionVersion>,
    private connection: Connection,
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
      }

      version.status = ProfessionVersionStatus.Live;
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

  async allDraftOrLive(): Promise<Profession[]> {
    const versions = await this.versionsWithJoins()
      .distinctOn(['professionVersion.profession'])
      .where('professionVersion.status IN(:...status)', {
        status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
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
      .leftJoinAndSelect('professionVersion.organisation', 'organisation')
      .leftJoinAndSelect('professionVersion.industries', 'industries')
      .leftJoinAndSelect('professionVersion.qualification', 'qualification')
      .leftJoinAndSelect('professionVersion.legislations', 'legislations');
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { ProfessionVersionsService } from './profession-versions.service';
import professionVersionFactory from '../testutils/factories/profession-version';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';
import professionFactory from '../testutils/factories/profession';
import { Profession } from './profession.entity';

describe('ProfessionVersionsService', () => {
  let service: ProfessionVersionsService;
  let repo: Repository<ProfessionVersion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionVersionsService,
        {
          provide: getRepositoryToken(ProfessionVersion),
          useValue: createMock<Repository<ProfessionVersion>>(),
        },
      ],
    }).compile();

    service = module.get<ProfessionVersionsService>(ProfessionVersionsService);
    repo = module.get<Repository<ProfessionVersion>>(
      getRepositoryToken(ProfessionVersion),
    );
  });

  describe('save', () => {
    it('saves the entity', async () => {
      const professionVersion = professionVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(professionVersion);
      const result = await service.save(professionVersion);

      expect(result).toEqual(professionVersion);
      expect(repoSpy).toHaveBeenCalledWith(professionVersion);
    });
  });

  describe('find', () => {
    it('returns a ProfessionVersion', async () => {
      const professionVersion = professionVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(professionVersion);
      const result = await service.find('some-uuid');

      expect(result).toEqual(professionVersion);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('confirms a Profession', async () => {
      const professionVersion = professionVersionFactory.build();

      const updatedVersion = {
        ...professionVersion,
        status: ProfessionVersionStatus.Draft,
      };

      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(professionVersion);
      const result = await service.confirm(professionVersion);

      expect(result).toEqual(updatedVersion);
      expect(repoSpy).toHaveBeenCalledWith(updatedVersion);
    });
  });

  describe('findWithProfession', () => {
    it('searches for a ProfessionVersion with its Profession', async () => {
      const version = professionVersionFactory.build();
      const profession = professionFactory.build({ versions: [version] });

      version.profession = profession;

      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(version);

      const result = await service.findWithProfession(version.id);

      expect(result).toEqual(version);

      expect(repoSpy).toHaveBeenCalledWith(version.id, {
        relations: ['profession'],
      });
    });
  });

  describe('findLatestForProfessionId', () => {
    it('searches for the latest Profession with an active status', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build();

      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(version);

      const result = await service.findLatestForProfessionId(profession.id);

      expect(result).toEqual(version);

      expect(repoSpy).toHaveBeenCalledWith({
        where: {
          profession: { id: profession.id },
          status: In([
            ProfessionVersionStatus.Draft,
            ProfessionVersionStatus.Live,
          ]),
        },
        order: { created_at: 'DESC' },
        relations: ['profession'],
      });
    });
  });

  describe('allLive', () => {
    it('fetches all of currently live professions', async () => {
      const versions = professionVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allLive();

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'professionVersion.organisation',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status = :status',
        {
          status: ProfessionVersionStatus.Live,
        },
      );
    });
  });

  describe('allDraftOrLive', () => {
    it('gets all Professions and their latest draft or live version', async () => {
      const versions = professionVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        distinctOn: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allDraftOrLive();

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'professionVersion.profession',
      ]);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.organisation',
        'professionVersion.industries',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status IN(:...status)',
        {
          status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'professionVersion.profession, professionVersion.created_at',
        'DESC',
      );
    });
  });

  describe('findLiveBySlug', () => {
    it('fetches a live Profession by its slug', async () => {
      const version = professionVersionFactory.build();
      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getOne: async () => version,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.findLiveBySlug('some-slug');
      const expectedVersion = Profession.withVersion(
        version.profession,
        version,
      );

      expect(result).toEqual(expectedVersion);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'professionVersion.organisation',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.versions',
        'organisationVersions',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status = :status AND profession.slug = :slug',
        {
          status: ProfessionVersionStatus.Live,
          slug: 'some-slug',
        },
      );
    });
  });

  describe('findByIdWithProfession', () => {
    it('returns an Profession with a version', async () => {
      const version = professionVersionFactory.build();
      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getOne: async () => version,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.findByIdWithProfession(
        'profession-uuid',
        'version-uuid',
      );

      expect(result).toEqual(
        Profession.withVersion(version.profession, version),
      );

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'professionVersion.organisation',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.versions',
        'organisationVersions',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith({
        profession: { id: 'profession-uuid' },
        id: 'version-uuid',
      });
    });
  });
});

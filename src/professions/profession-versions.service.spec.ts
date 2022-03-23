import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import {
  Connection,
  In,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionsSearchService } from './professions-search.service';
import professionVersionFactory from '../testutils/factories/profession-version';
import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from './profession-version.entity';
import professionFactory from '../testutils/factories/profession';
import { Profession } from './profession.entity';
import { Nation } from '../nations/nation';
import legislationFactory from '../testutils/factories/legislation';
import userFactory from '../testutils/factories/user';
import qualificationFactory from '../testutils/factories/qualification';
import industryFactory from '../testutils/factories/industry';
import organisationFactory from '../testutils/factories/organisation';

describe('ProfessionVersionsService', () => {
  let service: ProfessionVersionsService;
  let repo: Repository<ProfessionVersion>;
  let connection: DeepMocked<Connection>;
  let searchService: DeepMocked<ProfessionsSearchService>;

  beforeEach(async () => {
    connection = createMock<Connection>();
    searchService = createMock<ProfessionsSearchService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionVersionsService,
        {
          provide: getRepositoryToken(ProfessionVersion),
          useValue: createMock<Repository<ProfessionVersion>>(),
        },
        {
          provide: Connection,
          useValue: connection,
        },
        {
          provide: ProfessionsSearchService,
          useValue: searchService,
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

  describe('create', () => {
    describe('when the Profession is complete', () => {
      it('creates a copy of an existing version and sets the user', async () => {
        const legislation = legislationFactory.build();
        const qualification = qualificationFactory.build();
        const profession = professionFactory.build();

        const previousVersion = professionVersionFactory.build({
          profession: profession,
          legislations: [legislation],
          qualification: qualification,
        });

        const newQualification = {
          ...previousVersion.qualification,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        };

        const newLegislation = {
          ...legislation,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        };
        const user = userFactory.build();

        const repoSpy = jest.spyOn(repo, 'save');

        await service.create(previousVersion, user);

        expect(repoSpy).toHaveBeenCalledWith({
          ...previousVersion,
          id: undefined,
          status: undefined,
          created_at: undefined,
          updated_at: undefined,
          qualification: newQualification,
          legislations: [newLegislation],
          profession: profession,
          user: user,
        });
      });
    });

    describe('when the Profession has just been created by a service owner user', () => {
      it('creates a copy of an existing version and sets the user', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        const previousVersion = professionVersionFactory
          .justCreated('version-id')
          .build({
            legislations: [],
            qualification: undefined,
            profession: profession,
          });

        const user = userFactory.build();

        const repoSpy = jest.spyOn(repo, 'save');

        await service.create(previousVersion, user);

        expect(repoSpy).toHaveBeenCalledWith({
          ...previousVersion,
          id: undefined,
          status: undefined,
          created_at: undefined,
          updated_at: undefined,
          qualification: undefined,
          legislations: [],
          profession: profession,
          user: user,
        });
      });
    });
  });

  describe('publish', () => {
    let queryRunner: DeepMocked<QueryRunner>;

    beforeEach(() => {
      queryRunner = createMock<QueryRunner>();

      jest
        .spyOn(connection, 'createQueryRunner')
        .mockImplementation(() => queryRunner);
    });

    it('publishes the draft version', async () => {
      const version = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      const findSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(() => undefined);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(version);

      const result = await service.publish(version);

      expect(result.status).toBe(ProfessionVersionStatus.Live);

      expect(findSpy).toHaveBeenCalledWith({
        profession: version.profession,
        status: ProfessionVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...version,
        status: ProfessionVersionStatus.Live,
      });

      expect(searchService.index).toBeCalledWith({
        ...version,
        status: ProfessionVersionStatus.Live,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('demotes the latest live version', async () => {
      const liveVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Live,
      });

      const profession = professionFactory.build({
        versions: [liveVersion],
      });

      const draftVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
        profession,
      });

      const saveSpy = jest.spyOn(repo, 'save');
      const findSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(async () => liveVersion);

      const result = await service.publish(draftVersion);

      expect(result.status).toBe(ProfessionVersionStatus.Live);

      expect(findSpy).toHaveBeenCalledWith({
        profession,
        status: ProfessionVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...liveVersion,
        status: ProfessionVersionStatus.Archived,
      });

      expect(searchService.delete).toHaveBeenCalledWith({
        ...liveVersion,
        status: ProfessionVersionStatus.Archived,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...draftVersion,
        status: ProfessionVersionStatus.Live,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back the transaction if an error occurs', async () => {
      const version = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      jest.spyOn(repo, 'save').mockImplementation(() => {
        throw Error;
      });

      await service.publish(version);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    let queryRunner: DeepMocked<QueryRunner>;

    beforeEach(() => {
      queryRunner = createMock<QueryRunner>();

      jest
        .spyOn(connection, 'createQueryRunner')
        .mockImplementation(() => queryRunner);
    });

    it('archives the draft version', async () => {
      const version = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      const findSpy = jest.spyOn(repo, 'findOne');
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(version);

      const result = await service.archive(version);

      expect(result.status).toBe(ProfessionVersionStatus.Archived);

      expect(findSpy).toHaveBeenCalledWith({
        profession: version.profession,
        status: ProfessionVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...version,
        status: ProfessionVersionStatus.Archived,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('demotes the latest live version', async () => {
      const liveVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Live,
      });

      const profession = professionFactory.build({
        versions: [liveVersion],
      });

      const draftVersion = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
        profession,
      });

      const saveSpy = jest.spyOn(repo, 'save');
      const findSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(liveVersion);

      const result = await service.archive(draftVersion);

      expect(result.status).toBe(ProfessionVersionStatus.Archived);

      expect(findSpy).toHaveBeenCalledWith({
        profession,
        status: ProfessionVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...liveVersion,
        status: ProfessionVersionStatus.Draft,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...draftVersion,
        status: ProfessionVersionStatus.Archived,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('deletes all versions from opensearch', async () => {
      const version = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      const otherVersions = professionVersionFactory.buildList(3);

      (repo.find as jest.Mock).mockReturnValue(otherVersions);

      await service.archive(version);

      expect(searchService.bulkDelete).toHaveBeenCalledWith(otherVersions);

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back the transaction if an error occurs', async () => {
      const version = professionVersionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      jest.spyOn(repo, 'save').mockImplementation(() => {
        throw Error;
      });

      await service.archive(version);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
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
        orderBy: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allLive();

      expect(result).toEqual(versions);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status = :status',
        {
          status: ProfessionVersionStatus.Live,
        },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('profession.name');
    });
  });

  describe('allWithLatestVersion', () => {
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

      const result = await service.allWithLatestVersion();

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'professionVersion.profession',
        'profession.name',
      ]);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.industries',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status IN(:...status)',
        {
          status: [
            ProfessionVersionStatus.Live,
            ProfessionVersionStatus.Draft,
            ProfessionVersionStatus.Archived,
          ],
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'profession.name, professionVersion.profession, professionVersion.created_at',
        'DESC',
      );
    });
  });

  describe('allWithLatestVersionForOrganisation', () => {
    it('gets all Professions for a given organisation, and their latest draft or live version', async () => {
      const versions = professionVersionFactory.buildList(5);
      const organisation = organisationFactory.build();

      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        andWhere: () => queryBuilder,
        distinctOn: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allWithLatestVersionForOrganisation(
        organisation,
      );

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'professionVersion.profession',
        'profession.name',
      ]);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.industries',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status IN(:...status)',
        {
          status: [
            ProfessionVersionStatus.Live,
            ProfessionVersionStatus.Draft,
            ProfessionVersionStatus.Archived,
          ],
        },
      );

      expect(queryBuilder.andWhere).toBeCalledWith(
        'organisation.id = :organisationId',
        {
          organisationId: organisation.id,
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'profession.name, professionVersion.profession, professionVersion.created_at',
        'DESC',
      );
    });
  });

  describe('latestVersion', () => {
    it('gets the latest version for a profession', async () => {
      const profession = professionFactory.build();
      const version = professionVersionFactory.build({
        profession: profession,
      });
      const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        distinctOn: () => queryBuilder,
        orderBy: () => queryBuilder,
        getOne: async () => version,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.latestVersion(profession);

      expect(result).toEqual(version);

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'professionVersion.profession',
        'profession.name',
      ]);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.industries',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'professionVersion.status IN(:...status)',
        {
          status: [ProfessionVersionStatus.Live, ProfessionVersionStatus.Draft],
        },
      );

      expect(queryBuilder.where).toHaveBeenCalledWith({
        profession: profession,
      });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'profession.name, professionVersion.profession, professionVersion.created_at',
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
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.versions',
        'organisationVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'additionalOrganisation.versions',
        'additionalOrganisationVersions',
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

  describe('hasLiveVersion', () => {
    describe('when the Profession has a live version', () => {
      it('returns `true`', async () => {
        const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          getCount: async () => 1,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const profession = professionFactory.build();

        const result = await service.hasLiveVersion(profession);

        expect(result).toEqual(true);

        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'professionVersion.profession',
          'profession',
        );

        expect(queryBuilder.where).toHaveBeenCalledWith(
          'professionVersion.status = :status AND profession.id = :id',
          {
            status: ProfessionVersionStatus.Live,
            id: profession.id,
          },
        );

        expect(queryBuilder.getCount).toBeCalled();
      });
    });

    describe('when the Profession does not have a live version', () => {
      it('returns `false`', async () => {
        const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          getCount: async () => 0,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const profession = professionFactory.build();

        const result = await service.hasLiveVersion(profession);

        expect(result).toEqual(false);

        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'professionVersion.profession',
          'profession',
        );

        expect(queryBuilder.where).toHaveBeenCalledWith(
          'professionVersion.status = :status AND profession.id = :id',
          {
            status: ProfessionVersionStatus.Live,
            id: profession.id,
          },
        );

        expect(queryBuilder.getCount).toBeCalled();
      });
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

      expect(result).toEqual(version);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.user',
        'professionVersion.qualification',
        'professionVersion.legislations',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.versions',
        'organisationVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'additionalOrganisation.versions',
        'additionalOrganisationVersions',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith({
        profession: { id: 'profession-uuid' },
        id: 'version-uuid',
      });
    });
  });

  describe('searchLive', () => {
    const versions = professionVersionFactory.buildList(5);
    const queryBuilder = createMock<SelectQueryBuilder<ProfessionVersion>>({
      leftJoinAndSelect: () => queryBuilder,
      where: () => queryBuilder,
      andWhere: () => queryBuilder,
      orderBy: () => queryBuilder,
      getMany: async () => versions,
    });

    beforeEach(() => {
      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);
    });

    it('returns all live professions when no arguments are passed', async () => {
      const filter = {
        keywords: '',
        nations: [],
        industries: [],
      };

      const result = await service.searchLive(filter);

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder).toHaveJoined([
        'professionVersion.profession',
        'professionVersion.industries',
        'profession.organisation',
        'profession.additionalOrganisation',
        'professionVersion.user',
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

    it('makes a search query to opensearch and filters by the resulting IDs when keywords are provided', async () => {
      const filter = {
        keywords: 'some-keyword',
        nations: [],
        industries: [],
      };

      (searchService.search as jest.Mock).mockReturnValue(['123', '456']);

      const result = await service.searchLive(filter);

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(searchService.search).toHaveBeenCalledWith('some-keyword');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith({
        id: In(['123', '456']),
      });
    });

    it('filters by nations when provided', async () => {
      const filter = {
        keywords: '',
        nations: [Nation.find('GB-ENG'), Nation.find('GB-NIR')],
        industries: [],
      };

      const result = await service.searchLive(filter);

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'professionVersion.occupationLocations @> :nations',
        {
          nations: ['GB-ENG', 'GB-NIR'],
        },
      );
    });

    it('filters by industries when provided', async () => {
      const industries = [
        industryFactory.build({ id: 'some-uuid' }),
        industryFactory.build({ id: 'other-uuid' }),
      ];
      const filter = {
        keywords: '',
        nations: [],
        industries: industries,
      };

      const result = await service.searchLive(filter);

      const expectedProfessions = versions.map((version) =>
        Profession.withVersion(version.profession, version),
      );

      expect(result).toEqual(expectedProfessions);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'industries.id IN(:...industries)',
        {
          industries: ['some-uuid', 'other-uuid'],
        },
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

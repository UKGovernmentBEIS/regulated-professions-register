import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import {
  Repository,
  In,
  SelectQueryBuilder,
  Connection,
  QueryRunner,
  Not,
  Any,
} from 'typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';
import { Nation } from '../nations/nation';

import { OrganisationVersionsService } from './organisation-versions.service';
import { OrganisationsSearchService } from './organisations-search.service';

import organisationVersionFactory from '../testutils/factories/organisation-version';
import organisationFactory from '../testutils/factories/organisation';
import userFactory from '../testutils/factories/user';
import industryFactory from '../testutils/factories/industry';

import { ProfessionVersionStatus } from '../professions/profession-version.entity';
import { ProfessionVersionsService } from '../professions/profession-versions.service';
import { RegulationType } from '../professions/profession-version.entity';

describe('OrganisationVersionsService', () => {
  let service: OrganisationVersionsService;
  let repo: Repository<OrganisationVersion>;
  let connection: DeepMocked<Connection>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let organisationsSearchService: DeepMocked<OrganisationsSearchService>;

  beforeEach(async () => {
    connection = createMock<Connection>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    organisationsSearchService = createMock<OrganisationsSearchService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationVersionsService,
        {
          provide: getRepositoryToken(OrganisationVersion),
          useValue: createMock<Repository<OrganisationVersion>>(),
        },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: OrganisationsSearchService,
          useValue: organisationsSearchService,
        },
        {
          provide: Connection,
          useValue: connection,
        },
      ],
    }).compile();

    service = module.get<OrganisationVersionsService>(
      OrganisationVersionsService,
    );
    repo = module.get<Repository<OrganisationVersion>>(
      getRepositoryToken(OrganisationVersion),
    );
  });

  describe('save', () => {
    it('saves the entity', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(organisationVersion);
      const result = await service.save(organisationVersion);

      expect(result).toEqual(organisationVersion);
      expect(repoSpy).toHaveBeenCalledWith(organisationVersion);
    });
  });

  describe('find', () => {
    it('returns an OrganisationVersion', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisationVersion);
      const result = await service.find('some-uuid');

      expect(result).toEqual(organisationVersion);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('all', () => {
    it('returns all OrganisationVersion', async () => {
      const organisationVersions = organisationVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getMany: async () => organisationVersions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.all();

      expect(result).toEqual(organisationVersions);

      expectJoinsToHaveBeenApplied(queryBuilder);

      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findByIdWithOrganisation', () => {
    it('returns an Organisation with a version, fetching its draft and live professions', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getOne: async () => organisationVersion,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.findByIdWithOrganisation(
        'org-uuid',
        'version-uuid',
      );

      expect(result).toEqual(organisationVersion);

      expectJoinsToHaveBeenApplied(queryBuilder);

      expect(queryBuilder.where).toHaveBeenCalledWith({
        organisation: { id: 'org-uuid' },
        id: 'version-uuid',
      });
    });
  });

  describe('confirm', () => {
    it('sets a status and a user on the version', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const updatedVersion = {
        ...organisationVersion,
        status: OrganisationVersionStatus.Draft,
      };

      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(updatedVersion);
      const result = await service.confirm(organisationVersion);

      expect(result).toEqual(updatedVersion);
      expect(repoSpy).toHaveBeenCalledWith(updatedVersion);
    });

    it('indexes the version in opensearch', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const updatedVersion = {
        ...organisationVersion,
        status: OrganisationVersionStatus.Draft,
      };

      await service.confirm(organisationVersion);

      expect(organisationsSearchService.index).toHaveBeenCalledWith(
        updatedVersion,
      );
    });
  });

  describe('create', () => {
    it('creates a copy of the version passed in, setting the user on it', async () => {
      const version = organisationVersionFactory.build();
      const user = userFactory.build();

      const repoSpy = jest.spyOn(repo, 'save');

      await service.create(version, user);

      expect(repoSpy).toHaveBeenCalledWith({
        ...version,
        id: undefined,
        user: user,
        created_at: undefined,
        updated_at: undefined,
        organisation: version.organisation,
      });
    });
  });

  describe('findLatestForOrganisationId', () => {
    it('searches for the latest organisation with an active status', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build();

      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(version);

      const result = await service.findLatestForOrganisationId(organisation.id);

      expect(result).toEqual(version);

      expect(repoSpy).toHaveBeenCalledWith({
        where: {
          organisation: { id: organisation.id },
          status: In([
            OrganisationVersionStatus.Draft,
            OrganisationVersionStatus.Live,
          ]),
        },
        order: { created_at: 'DESC' },
        relations: ['organisation'],
      });
    });
  });

  describe('allLive', () => {
    it('fetches all currently live organisations', async () => {
      const versions = organisationVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        distinctOn: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allLive();

      const expectedOrganisations = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrganisations);

      expectJoinsToHaveBeenApplied(queryBuilder);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status = :status',
        {
          status: OrganisationVersionStatus.Live,
        },
      );

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'organisation.name',
        'organisation',
      ]);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'organisation.name, organisation',
      );
    });
  });

  describe('allWithLatestVersion', () => {
    it('gets all organisations and their latest draft or live version with draft or live Professions', async () => {
      const versions = organisationVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
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

      const expectedOrganisations = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrganisations);

      expectJoinsToHaveBeenApplied(
        queryBuilder,
        "professionVersions.status = 'live' OR professionVersions.status = 'draft'",
      );

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status IN(:...organisationStatus)',
        {
          organisationStatus: [
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
            OrganisationVersionStatus.Archived,
          ],
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'organisation.name, organisationVersion.organisation, profession.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      );
    });
  });

  describe('findLiveBySlug', () => {
    it('fetches a live organisation by its slug', async () => {
      const version = organisationVersionFactory.build();
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        getOne: async () => version,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.findLiveBySlug('some-slug');
      const expectedVersion = Organisation.withVersion(
        version.organisation,
        version,
      );

      expect(result).toEqual(expectedVersion);

      expectJoinsToHaveBeenApplied(queryBuilder);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status = :status AND organisation.slug = :slug',
        {
          status: OrganisationVersionStatus.Live,
          slug: 'some-slug',
        },
      );
    });
  });

  describe('hasLiveVersion', () => {
    describe('when the Organisation has a live version', () => {
      it('returns `true`', async () => {
        const queryBuilder = createMock<
          SelectQueryBuilder<OrganisationVersion>
        >({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          getCount: async () => 1,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const organisation = organisationFactory.build();

        const result = await service.hasLiveVersion(organisation);

        expect(result).toEqual(true);

        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'organisationVersion.organisation',
          'organisation',
        );

        expect(queryBuilder.where).toHaveBeenCalledWith(
          'organisationVersion.status = :status AND organisation.id = :id',
          {
            status: ProfessionVersionStatus.Live,
            id: organisation.id,
          },
        );

        expect(queryBuilder.getCount).toBeCalled();
      });
    });

    describe('when the Organisation does not have a live version', () => {
      it('returns `false`', async () => {
        const queryBuilder = createMock<
          SelectQueryBuilder<OrganisationVersion>
        >({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          getCount: async () => 0,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const organisation = organisationFactory.build();

        const result = await service.hasLiveVersion(organisation);

        expect(result).toEqual(false);

        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
          'organisationVersion.organisation',
          'organisation',
        );

        expect(queryBuilder.where).toHaveBeenCalledWith(
          'organisationVersion.status = :status AND organisation.id = :id',
          {
            status: ProfessionVersionStatus.Live,
            id: organisation.id,
          },
        );

        expect(queryBuilder.getCount).toBeCalled();
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
      const version = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Draft,
      });

      const findSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(() => undefined);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(version);

      const result = await service.publish(version);

      expect(result.status).toBe(OrganisationVersionStatus.Live);

      expect(findSpy).toHaveBeenCalledWith({
        organisation: version.organisation,
        status: OrganisationVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...version,
        status: OrganisationVersionStatus.Live,
      });

      expect(organisationsSearchService.index).toBeCalledWith({
        ...version,
        status: OrganisationVersionStatus.Live,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('demotes the latest live version', async () => {
      const liveVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Live,
      });

      const organisation = organisationFactory.build({
        versions: [liveVersion],
      });

      const draftVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Draft,
        organisation: organisation,
      });

      const saveSpy = jest.spyOn(repo, 'save');
      const findSpy = jest
        .spyOn(repo, 'findOne')
        .mockImplementation(async () => liveVersion);

      const result = await service.publish(draftVersion);

      expect(result.status).toBe(OrganisationVersionStatus.Live);

      expect(findSpy).toHaveBeenCalledWith({
        organisation: organisation,
        status: OrganisationVersionStatus.Live,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...liveVersion,
        status: OrganisationVersionStatus.Archived,
      });

      expect(saveSpy).toHaveBeenCalledWith({
        ...draftVersion,
        status: OrganisationVersionStatus.Live,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back the transaction if an error occurs', async () => {
      const version = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Draft,
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

    it('archives the given version and all other live or draft versions', async () => {
      const inputVersion = organisationVersionFactory.build();

      const draftVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Draft,
      });

      const liveVersion = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Live,
      });

      const archivedVersion = {
        ...draftVersion,
        status: OrganisationVersionStatus.Archived,
      };

      const findSpy = jest
        .spyOn(repo, 'find')
        .mockResolvedValue([draftVersion, liveVersion]);

      const saveSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(archivedVersion);

      const result = await service.archive(inputVersion);

      expect(result.status).toBe(OrganisationVersionStatus.Archived);

      expect(findSpy).toHaveBeenCalledWith({
        where: {
          organisation: inputVersion.organisation,
          id: Not(inputVersion.id),
          status: Any([
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
          ]),
        },
      });

      expect(saveSpy).toHaveBeenCalledWith([
        {
          ...draftVersion,
          status: OrganisationVersionStatus.Archived,
        },
        {
          ...liveVersion,
          status: OrganisationVersionStatus.Archived,
        },
      ]);

      expect(saveSpy).toHaveBeenCalledWith({
        ...inputVersion,
        status: OrganisationVersionStatus.Archived,
      });

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back the transaction if an error occurs', async () => {
      const version = organisationVersionFactory.build({
        status: OrganisationVersionStatus.Draft,
      });

      jest.spyOn(repo, 'save').mockImplementation(() => {
        throw Error;
      });

      await service.archive(version);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('searchLive', () => {
    let versions: OrganisationVersion[];
    let queryBuilder: SelectQueryBuilder<OrganisationVersion>;

    beforeEach(() => {
      versions = organisationVersionFactory.buildList(5);

      queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        distinctOn: () => queryBuilder,
        where: () => queryBuilder,
        orderBy: () => queryBuilder,
        andWhere: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);
    });

    it('returns all organisations with a given status when no filter arguments are passed', async () => {
      const filter = {
        keywords: '',
        nations: [],
        industries: [],
      };

      const result = await service.searchLive(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expectJoinsToHaveBeenApplied(queryBuilder);

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'organisation.name',
        'organisation',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status = :status',
        {
          status: OrganisationVersionStatus.Live,
        },
      );
    });

    it('makes a search query to opensearch and filters by the resulting IDs when keywords are provided', async () => {
      const filter = {
        keywords: 'some-keyword',
        nations: [],
        industries: [],
      };

      (organisationsSearchService.search as jest.Mock).mockReturnValue([
        '123',
        '456',
      ]);

      const result = await service.searchLive(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(organisationsSearchService.search).toHaveBeenCalledWith(
        'some-keyword',
      );

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

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'professionVersions.occupationLocations && :nations',
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

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'industries.id IN(:...industries)',
        {
          industries: ['some-uuid', 'other-uuid'],
        },
      );
    });
  });

  describe('searchWithLatestVersion', () => {
    let versions: OrganisationVersion[];
    let queryBuilder: SelectQueryBuilder<OrganisationVersion>;

    beforeEach(() => {
      versions = organisationVersionFactory.buildList(5);
      queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        distinctOn: () => queryBuilder,
        andWhere: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => versions,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);
    });

    it('returns all organisations with a given status when no filter arguments are passed', async () => {
      const filter = {
        keywords: '',
        nations: [],
        industries: [],
      };

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expectJoinsToHaveBeenApplied(
        queryBuilder,
        "professionVersions.status = 'live' OR professionVersions.status = 'draft'",
      );

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'organisationVersion.organisation',
        'organisation.name',
        'profession.id',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status IN(:...organisationStatus)',
        {
          organisationStatus: [
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
            OrganisationVersionStatus.Archived,
          ],
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'organisation.name, organisationVersion.organisation, profession.id, professionVersions.created_at, organisationVersion.created_at',
        'DESC',
      );
    });

    it('makes a search query to opensearch and filters by the resulting IDs when keywords are provided', async () => {
      const filter = {
        keywords: 'some-keyword',
        nations: [],
        industries: [],
      };

      (organisationsSearchService.search as jest.Mock).mockReturnValue([
        '123',
        '456',
      ]);

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(organisationsSearchService.search).toHaveBeenCalledWith(
        'some-keyword',
      );

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

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'professionVersions.occupationLocations && :nations',
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

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'industries.id IN(:...industries)',
        {
          industries: ['some-uuid', 'other-uuid'],
        },
      );
    });

    it('filters by organisation when provided', async () => {
      const organisation1 = organisationFactory.build({ id: 'some-uuid' });
      const organisation2 = organisationFactory.build({
        id: 'some-other-uuid',
      });

      const filter = {
        keywords: '',
        nations: [],
        industries: [],
        organisations: [organisation1, organisation2],
      };

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'organisation.id IN(:...organisations)',
        {
          organisations: ['some-uuid', 'some-other-uuid'],
        },
      );
    });

    it('filters by regulation type when provided', async () => {
      const filter = {
        keywords: '',
        nations: [],
        industries: [],
        regulationTypes: [RegulationType.Accreditation],
      };

      const result = await service.searchWithLatestVersion(filter);

      const expectedOrgs = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrgs);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'professionVersions.regulationType IN(:...regulationTypes)',
        {
          regulationTypes: [RegulationType.Accreditation],
        },
      );
    });
  });

  const expectJoinsToHaveBeenApplied = (
    queryBuilder: any,
    professionVersionsCondition: string = undefined,
  ) => {
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'organisationVersion.organisation',
      'organisation',
    );

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'organisationVersion.user',
      'user',
    );

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'organisation.professionToOrganisations',
      'professionToOrganisation',
    );

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'professionToOrganisation.profession',
      'profession',
    );

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'profession.versions',
      'professionVersions',
      professionVersionsCondition,
    );

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'professionVersions.industries',
      'industries',
    );
  };

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

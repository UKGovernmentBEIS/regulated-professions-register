import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import {
  Repository,
  In,
  SelectQueryBuilder,
  Connection,
  QueryRunner,
} from 'typeorm';
import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';
import { OrganisationVersionsService } from './organisation-versions.service';

import organisationVersionFactory from '../testutils/factories/organisation-version';
import organisationFactory from '../testutils/factories/organisation';

describe('OrganisationVersionsService', () => {
  let service: OrganisationVersionsService;
  let repo: Repository<OrganisationVersion>;
  let connection: DeepMocked<Connection>;

  beforeEach(async () => {
    connection = createMock<Connection>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationVersionsService,
        {
          provide: getRepositoryToken(OrganisationVersion),
          useValue: createMock<Repository<OrganisationVersion>>(),
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

  describe('findByIdWithOrganisation', () => {
    it('returns an Organisation with a version', async () => {
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

      expect(queryBuilder).toHaveJoined([
        'organisationVersion.organisation',
        'organisation.professions',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.versions',
        'professionVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professionVersions.industries',
        'industries',
      );

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
    it('fetches all of currently live organisations', async () => {
      const versions = organisationVersionFactory.buildList(5);
      const queryBuilder = createMock<SelectQueryBuilder<OrganisationVersion>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
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

      expect(queryBuilder).toHaveJoined([
        'organisationVersion.organisation',
        'organisation.professions',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.versions',
        'professionVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professionVersions.industries',
        'industries',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status = :status',
        {
          status: OrganisationVersionStatus.Live,
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('organisation.name');
    });
  });

  describe('allDraftOrLive', () => {
    it('gets all organisations and their latest draft or live version', async () => {
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

      const result = await service.allDraftOrLive();

      const expectedOrganisations = versions.map((version) =>
        Organisation.withVersion(version.organisation, version),
      );

      expect(result).toEqual(expectedOrganisations);

      expect(queryBuilder).toHaveJoined([
        'organisationVersion.organisation',
        'organisation.professions',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.versions',
        'professionVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professionVersions.industries',
        'industries',
      );

      expect(queryBuilder.distinctOn).toHaveBeenCalledWith([
        'organisationVersion.organisation',
      ]);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status IN(:...status)',
        {
          status: [
            OrganisationVersionStatus.Live,
            OrganisationVersionStatus.Draft,
          ],
        },
      );

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'organisationVersion.organisation, organisationVersion.created_at',
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

      expect(queryBuilder).toHaveJoined([
        'organisationVersion.organisation',
        'organisation.professions',
      ]);

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.versions',
        'professionVersions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professionVersions.industries',
        'industries',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organisationVersion.status = :status AND organisation.slug = :slug',
        {
          status: OrganisationVersionStatus.Live,
          slug: 'some-slug',
        },
      );
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
});

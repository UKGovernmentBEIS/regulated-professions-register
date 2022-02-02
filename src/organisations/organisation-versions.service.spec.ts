import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

import { Repository, In, SelectQueryBuilder } from 'typeorm';
import organisationVersionFactory from '../testutils/factories/organisation-version';
import organisationFactory from '../testutils/factories/organisation';

import {
  OrganisationVersion,
  OrganisationVersionStatus,
} from './organisation-version.entity';
import { Organisation } from './organisation.entity';
import { OrganisationVersionsService } from './organisation-versions.service';

describe('OrganisationVersionsService', () => {
  let service: OrganisationVersionsService;
  let repo: Repository<OrganisationVersion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationVersionsService,
        {
          provide: getRepositoryToken(OrganisationVersion),
          useValue: createMock<Repository<OrganisationVersion>>(),
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

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisationVersion.organisation',
        'organisation',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.professions',
        'professions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.industries',
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

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisationVersion.organisation',
        'organisation',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'organisation.professions',
        'professions',
      );

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'professions.industries',
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
});

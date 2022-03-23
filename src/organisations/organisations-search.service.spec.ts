import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { OpensearchClient } from 'nestjs-opensearch';

import { OrganisationsSearchService } from './organisations-search.service';
import organisationVersionFactory from '../testutils/factories/organisation-version';

describe('OrganisationsSearchService', () => {
  let service: OrganisationsSearchService;
  let opensearchClient: DeepMocked<OpensearchClient>;

  beforeEach(async () => {
    opensearchClient = createMock<OpensearchClient>({
      indices: {
        delete: jest.fn(),
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsSearchService,
        {
          provide: OpensearchClient,
          useValue: opensearchClient,
        },
      ],
    }).compile();

    service = module.get<OrganisationsSearchService>(
      OrganisationsSearchService,
    );
  });

  describe('indexName', () => {
    it('appends the environment name to the index', () => {
      expect(service.indexName).toEqual('organisations_test');
    });
  });

  describe('index', () => {
    it('indexes the entity', async () => {
      const organisationVersion = organisationVersionFactory.build();

      service.index(organisationVersion);

      expect(opensearchClient.index).toHaveBeenCalledWith({
        id: organisationVersion.id,
        index: service.indexName,
        body: {
          name: organisationVersion.organisation.name,
          alternateName: organisationVersion.alternateName,
        },
      });
    });
  });

  describe('delete', () => {
    it('deletes the entity', async () => {
      const organisationVersion = organisationVersionFactory.build();

      service.delete(organisationVersion);

      expect(opensearchClient.delete).toHaveBeenCalledWith({
        index: service.indexName,
        id: organisationVersion.id,
      });
    });
  });

  describe('bulkDelete', () => {
    it('deletes all entities with given ids', async () => {
      const organisationVersion1 = organisationVersionFactory.build({
        id: 'some-uuid',
      });
      const organisationVersion2 = organisationVersionFactory.build({
        id: 'some-other-uuid',
      });

      service.bulkDelete([organisationVersion1, organisationVersion2]);

      expect(opensearchClient.deleteByQuery).toHaveBeenCalledWith({
        index: service.indexName,
        body: {
          query: {
            ids: {
              values: ['some-uuid', 'some-other-uuid'],
            },
          },
        },
      });
    });
  });

  describe('search', () => {
    it('runs a search query', async () => {
      (opensearchClient.search as jest.Mock).mockReturnValue({
        body: {
          hits: {
            hits: [
              {
                _id: '123',
              },
              {
                _id: '456',
              },
            ],
          },
        },
      });

      const result = await service.search('something');

      expect(result).toEqual(['123', '456']);

      expect(opensearchClient.search).toHaveBeenCalledWith({
        index: service.indexName,
        body: {
          query: {
            multi_match: {
              query: 'something',
              fields: ['name', 'alternateName'],
            },
          },
        },
      });
    });
  });

  describe('deleteAll', () => {
    it('deletes all documents in an index', async () => {
      await service.deleteAll();

      expect(opensearchClient.indices.delete).toHaveBeenCalledWith({
        index: service.indexName,
        ignore_unavailable: true,
      });
    });
  });
});

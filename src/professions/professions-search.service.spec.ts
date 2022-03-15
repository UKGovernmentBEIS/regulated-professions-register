import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { OpensearchClient } from 'nestjs-opensearch';

import { ProfessionsSearchService } from './professions-search.service';
import professionVersionFactory from '../testutils/factories/profession-version';

describe('ProfessionVersionsService', () => {
  let service: ProfessionsSearchService;
  let opensearchClient: DeepMocked<OpensearchClient>;

  beforeEach(async () => {
    opensearchClient = createMock<OpensearchClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsSearchService,
        {
          provide: OpensearchClient,
          useValue: opensearchClient,
        },
      ],
    }).compile();

    service = module.get<ProfessionsSearchService>(ProfessionsSearchService);
  });

  describe('indexName', () => {
    it('appends the environment name to the index', () => {
      expect(service.indexName).toEqual('professions_test');
    });
  });

  describe('index', () => {
    it('indexes the entity', async () => {
      const professionVersion = professionVersionFactory.build();

      service.index(professionVersion);

      expect(opensearchClient.index).toHaveBeenCalledWith({
        id: professionVersion.id,
        index: service.indexName,
        body: {
          name: professionVersion.profession.name,
        },
      });
    });
  });

  describe('delete', () => {
    it('deletes the entity', async () => {
      const professionVersion = professionVersionFactory.build();

      service.delete(professionVersion);

      expect(opensearchClient.delete).toHaveBeenCalledWith({
        index: service.indexName,
        id: professionVersion.id,
      });
    });
  });

  describe('bulkDelete', () => {
    it('deletes all entities with given ids', async () => {
      const professionVersion1 = professionVersionFactory.build({
        id: 'some-uuid',
      });
      const professionVersion2 = professionVersionFactory.build({
        id: 'some-other-uuid',
      });

      service.bulkDelete([professionVersion1, professionVersion2]);

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
              fields: ['name'],
            },
          },
        },
      });
    });
  });
});

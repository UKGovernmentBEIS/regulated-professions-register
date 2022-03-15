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

  describe('index', () => {
    it('indexes the entity', async () => {
      const professionVersion = professionVersionFactory.build();

      service.index(professionVersion);

      expect(opensearchClient.index).toHaveBeenCalledWith({
        id: professionVersion.id,
        index: 'professions',
        body: {
          name: professionVersion.profession.name,
        },
      });
    });
  });

  describe('delete', () => {
    it('delete the entity', async () => {
      const professionVersion = professionVersionFactory.build();

      service.delete(professionVersion);

      expect(opensearchClient.delete).toHaveBeenCalledWith({
        index: 'professions',
        id: professionVersion.id,
      });
    });
  });
});

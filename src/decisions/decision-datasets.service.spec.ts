import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import decisionDatasetFactory from '../testutils/factories/decision-dataset';
import { DecisionDataset } from './decision-dataset.entity';
import { DecisionDatasetsService as DecisionDatasetsService } from './decision-datasets.service';

describe('DecisionDatasetsService', () => {
  let service: DecisionDatasetsService;
  let repo: Repository<DecisionDataset>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecisionDatasetsService,
        {
          provide: getRepositoryToken(DecisionDataset),
          useValue: createMock<Repository<DecisionDataset>>(),
        },
      ],
    }).compile();

    service = module.get<DecisionDatasetsService>(DecisionDatasetsService);
    repo = module.get<Repository<DecisionDataset>>(
      getRepositoryToken(DecisionDataset),
    );
  });

  describe('find', () => {
    it('returns a DecisionDataset', async () => {
      const dataset = decisionDatasetFactory.build();
      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(dataset);
      const result = await service.find(
        'profession-uuid',
        'organisation-uuid',
        2024,
      );

      expect(result).toEqual(dataset);
      expect(repoSpy).toBeCalledWith({
        where: {
          profession: { id: 'profession-uuid' },
          organisation: { id: 'organisation-uuid' },
          year: 2024,
        },
        relations: ['profession', 'organisation', 'user'],
      });
    });
  });

  describe('save', () => {
    it('saves the DecisionDataset', async () => {
      const dataset = decisionDatasetFactory.build();
      const repoSpy = jest.spyOn(repo, 'save').mockResolvedValue(dataset);
      const result = await service.save(dataset);

      expect(result).toEqual(dataset);
      expect(repoSpy).toBeCalledWith(dataset);
    });
  });
});

import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import decisionDatasetFactory from '../testutils/factories/decision-dataset';
import organisationFactory from '../testutils/factories/organisation';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from './decision-dataset.entity';
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

  describe('all', () => {
    it('returns all live and draft DecisionDatasets', async () => {
      const datasets = decisionDatasetFactory.buildList(3);

      const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => datasets,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.all();

      expect(result).toEqual(datasets);
      expect(queryBuilder).toHaveJoined([
        'decisionDataset.profession',
        'decisionDataset.organisation',
        'decisionDataset.user',
      ]);
      expect(queryBuilder.where).toBeCalledWith(
        'decisionDataset.status IN(:...status)',
        {
          status: [DecisionDatasetStatus.Live, DecisionDatasetStatus.Draft],
        },
      );
      expect(queryBuilder.orderBy).toBeCalledWith({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      });
      expect(queryBuilder.getMany).toBeCalledWith();
    });
  });

  describe('allForOrganisation', () => {
    it('returns all live and draft DecisionDatasets for the given organisation', async () => {
      const datasets = decisionDatasetFactory.buildList(3);
      const organisation = organisationFactory.build();

      const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        andWhere: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => datasets,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const result = await service.allForOrganisation(organisation);

      expect(result).toEqual(datasets);
      expect(queryBuilder).toHaveJoined([
        'decisionDataset.profession',
        'decisionDataset.organisation',
        'decisionDataset.user',
      ]);
      expect(queryBuilder.where).toBeCalledWith(
        'decisionDataset.status IN(:...status)',
        {
          status: [DecisionDatasetStatus.Live, DecisionDatasetStatus.Draft],
        },
      );
      expect(queryBuilder.andWhere).toBeCalledWith({
        organisation: { id: organisation.id },
      });
      expect(queryBuilder.orderBy).toBeCalledWith({
        'profession.name': 'ASC',
        'organisation.name': 'ASC',
        year: 'DESC',
      });
      expect(queryBuilder.getMany).toBeCalledWith();
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

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

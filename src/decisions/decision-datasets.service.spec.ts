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
    describe('when an empty FilterInput is given', () => {
      it('returns all live and draft DecisionDatasets', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.all({});

        expect(result).toEqual(queryResultDatasets);
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

    describe('when a FilterInput with keywords is given', () => {
      it('returns all live and draft DecisionDatasets for the given keywords', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.all({
          keywords: 'safe-keyword uns%fe-keyword',
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          '(LOWER(profession.name) LIKE :keyword0 OR LOWER(profession.name) LIKE :keyword1)',
          { keyword0: '%safe-keyword%', keyword1: '%uns\\%fe-keyword%' },
        );
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with organisations is given', () => {
      it('returns all live and draft DecisionDatasets for the given organisations', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const organisation = organisationFactory.build({
          id: 'organisation-id',
        });

        const result = await service.all({
          organisations: [organisation],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          'organisation.id IN(:...organisations)',
          { organisations: ['organisation-id'] },
        );
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with years is given', () => {
      it('returns all live and draft DecisionDatasets for the given years', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.all({
          years: [2024, 2025],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith('year IN(:...years)', {
          years: [2024, 2025],
        });
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with decision dataset statuses is given', () => {
      it('returns all live and draft DecisionDatasets for the given decision dataset statuses', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.all({
          statuses: [DecisionDatasetStatus.Draft],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          'status IN(:...statuses)',
          {
            statuses: [DecisionDatasetStatus.Draft],
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
  });

  describe('allForOrganisation', () => {
    describe('when an empty FilterInput is given', () => {
      it('returns all live and draft DecisionDatasets for the given organisation', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);
        const organisation = organisationFactory.build();

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.allForOrganisation(organisation, {});

        expect(result).toEqual(queryResultDatasets);
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

    describe('when a FilterInput with keywords is given', () => {
      it('returns all live and draft DecisionDatasets for the given keywords', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);
        const organisation = organisationFactory.build();

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.allForOrganisation(organisation, {
          keywords: 'safe-keyword uns%fe-keyword',
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          '(LOWER(profession.name) LIKE :keyword0 OR LOWER(profession.name) LIKE :keyword1)',
          { keyword0: '%safe-keyword%', keyword1: '%uns\\%fe-keyword%' },
        );
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with organisations is given', () => {
      it('returns all live and draft DecisionDatasets for the given organisations', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);
        const organisation = organisationFactory.build();
        const filterOrganisation = organisationFactory.build({
          id: 'organisation-id',
        });

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.allForOrganisation(organisation, {
          organisations: [filterOrganisation],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          'organisation.id IN(:...organisations)',
          { organisations: ['organisation-id'] },
        );
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with years is given', () => {
      it('returns all live and draft DecisionDatasets for the given years', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);
        const organisation = organisationFactory.build();

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.allForOrganisation(organisation, {
          years: [2024, 2025],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith('year IN(:...years)', {
          years: [2024, 2025],
        });
        expect(queryBuilder.orderBy).toBeCalledWith({
          'profession.name': 'ASC',
          'organisation.name': 'ASC',
          year: 'DESC',
        });
        expect(queryBuilder.getMany).toBeCalledWith();
      });
    });

    describe('when a FilterInput with decision dataset statuses is given', () => {
      it('returns all live and draft DecisionDatasets for the given decision dataset statuses', async () => {
        const queryResultDatasets = decisionDatasetFactory.buildList(3);
        const organisation = organisationFactory.build();

        const queryBuilder = createMock<SelectQueryBuilder<DecisionDataset>>({
          leftJoinAndSelect: () => queryBuilder,
          where: () => queryBuilder,
          andWhere: () => queryBuilder,
          orderBy: () => queryBuilder,
          getMany: async () => queryResultDatasets,
        });

        jest
          .spyOn(repo, 'createQueryBuilder')
          .mockImplementation(() => queryBuilder);

        const result = await service.allForOrganisation(organisation, {
          statuses: [DecisionDatasetStatus.Live],
        });

        expect(result).toEqual(queryResultDatasets);
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
        expect(queryBuilder.andWhere).toBeCalledWith(
          'status IN(:...statuses)',
          {
            statuses: [DecisionDatasetStatus.Live],
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

  describe('submit', () => {
    it('sets the status of the DecisionDataset to Submitted', async () => {
      const draftDataset = decisionDatasetFactory.build({
        status: DecisionDatasetStatus.Draft,
      });

      const submittedDataset = {
        ...draftDataset,
        status: DecisionDatasetStatus.Submitted,
      };

      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(submittedDataset);

      const result = await service.submit(draftDataset);

      expect(result).toEqual(submittedDataset);
      expect(repoSpy).toBeCalledWith(submittedDataset);
    });
  });

  describe('publish', () => {
    it('sets the status of the DecisionDataset to Live', async () => {
      const draftDataset = decisionDatasetFactory.build({
        status: DecisionDatasetStatus.Draft,
      });

      const publishedDataset = {
        ...draftDataset,
        status: DecisionDatasetStatus.Live,
      };

      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(publishedDataset);

      const result = await service.publish(draftDataset);

      expect(result).toEqual(publishedDataset);
      expect(repoSpy).toBeCalledWith(publishedDataset);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

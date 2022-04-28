import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import professionFactory from '../testutils/factories/profession';
import decisionDatasetFactory from '../testutils/factories/decision-dataset';
import { DecisionDatasetsPresenter } from '../decisions/presenters/decision-datasets.presenter';
import { DecisionDatasetsService } from '../decisions/decision-datasets.service';
import { DecisionsController } from './decisions.controller';
import { ProfessionVersionsService } from '../professions/profession-versions.service';
import { ShowTemplate } from './interfaces/show-template.interface';

jest.mock('../decisions/presenters/decision-datasets.presenter');

describe('DecisionsController', () => {
  let controller: DecisionsController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [DecisionsController],
    }).compile();

    controller = module.get<DecisionsController>(DecisionsController);
  });

  describe('show', () => {
    describe('when the slug does not match a profession', () => {
      it('throws an error', async () => {
        professionVersionsService.findLiveBySlug.mockResolvedValue(null);

        await expect(async () => {
          await controller.show('example-invalid-slug', 2022);
        }).rejects.toThrowError(NotFoundException);
      });
    });

    describe('when the year does not match any dataset for the profession', () => {
      it('throws an error when the year does not match any dataset for the profession', async () => {
        const profession = professionFactory.build();

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);
        decisionDatasetsService.allLiveForProfessionAndYear.mockResolvedValue(
          [],
        );

        await expect(async () => {
          await controller.show('example-slug', 2022);
        }).rejects.toThrowError(NotFoundException);
      });
    });

    describe('when datasets exist for the given year and profession', () => {
      it('returns a populated ShowTemplate', async () => {
        const profession = professionFactory.build();
        const datasets = decisionDatasetFactory.buildList(3);

        const mockShowTemplate: ShowTemplate = {
          profession: 'Secondary School Teacher',
          nations: 'England, Wales',
          year: 2025,
          organisations: [
            {
              organisation: 'Department for Education',
              routes: [],
            },
          ],
        };

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);
        decisionDatasetsService.allLiveForProfessionAndYear.mockResolvedValue(
          datasets,
        );

        (
          DecisionDatasetsPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockShowTemplate);

        const result = await controller.show('example-slug', 2022);

        expect(result).toEqual(mockShowTemplate);

        expect(professionVersionsService.findLiveBySlug).toHaveBeenCalledWith(
          'example-slug',
        );
        expect(
          decisionDatasetsService.allLiveForProfessionAndYear,
        ).toHaveBeenCalledWith(profession, 2022);

        expect(DecisionDatasetsPresenter).toHaveBeenCalledWith(
          profession,
          2022,
          datasets,
          i18nService,
        );
        expect(DecisionDatasetsPresenter.prototype.present).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

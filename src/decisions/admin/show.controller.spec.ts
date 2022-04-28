import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { DecisionDatasetsService } from '../decision-datasets.service';
import * as checkCanChangeDatasetModule from './helpers/check-can-change-dataset.helper';
import { DecisionDatasetStatus } from '../decision-dataset.entity';
import { ShowController } from './show.controller';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { Table } from '../../common/interfaces/table';
import { ShowTemplate } from './interfaces/show-template.interface';

jest.mock('../presenters/decision-dataset.presenter');

const mockTables: Table[] = [
  {
    caption: 'Example route',
    head: [],
    rows: [],
  },
];

describe('ShowController', () => {
  let controller: ShowController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<ShowController>(ShowController);
  });

  describe('show', () => {
    it('presents the specified decision dataset', async () => {
      const profession = professionFactory.build({
        id: 'example-profession-id',
      });
      const organisation = organisationFactory.build({
        id: 'example-organisation-id',
      });

      const dataset = decisionDatasetFactory.build({
        profession: profession,
        organisation: organisation,
        year: 2017,
        status: DecisionDatasetStatus.Live,
      });

      const request = createDefaultMockRequest();

      const checkCanChangeDatasetSpy = jest
        .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
        .mockImplementation();

      professionsService.findWithVersions.mockResolvedValueOnce(profession);
      decisionDatasetsService.find.mockResolvedValue(dataset);

      (DecisionDatasetPresenter.prototype.tables as jest.Mock).mockReturnValue(
        mockTables,
      );

      Object.defineProperties(DecisionDatasetPresenter.prototype, {
        changedBy: {
          get() {
            return {
              name: 'name',
              email: 'email',
            };
          },
        },
        lastModified: {
          get() {
            return '29 Apr 2022';
          },
        },
      });

      const expected: ShowTemplate = {
        profession,
        organisation,
        changedBy: { name: 'name', email: 'email' },
        lastModified: '29 Apr 2022',
        tables: mockTables,
        year: 2017,
        isPublished: true,
        datasetStatus: DecisionDatasetStatus.Live,
      };

      const result = await controller.show(
        'example-profession-id',
        'example-organisation-id',
        2017,
        request,
      );

      expect(result).toEqual(expected);

      expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
        request,
        profession,
        organisation,
        2017,
        true,
      );

      expect(professionsService.findWithVersions).toHaveBeenCalledWith(
        'example-profession-id',
      );
      expect(decisionDatasetsService.find).toHaveBeenCalledWith(
        'example-profession-id',
        'example-organisation-id',
        2017,
      );

      expect(DecisionDatasetPresenter).toHaveBeenCalledWith(
        dataset,
        i18nService,
      );
      expect(DecisionDatasetPresenter.prototype.tables).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

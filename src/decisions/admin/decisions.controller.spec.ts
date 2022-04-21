import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Table } from '../../common/interfaces/table';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { DecisionsController } from './decisions.controller';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';
import * as checkCanChangeDatasetModule from './helpers/check-can-change-dataset.helper';
import { DecisionsCsvWriter } from './helpers/decisions-csv-writer.helper';
import { Response } from 'express';

jest.mock('./presenters/decision-datasets.presenter');
jest.mock('../presenters/decision-dataset.presenter');
jest.mock('./helpers/decisions-csv-writer.helper');

const mockIndexTemplate: IndexTemplate = {
  organisation: 'Example Organisation',
  decisionDatasetsTable: {
    head: [],
    rows: [],
  },
};

const mockTables: Table[] = [
  {
    caption: 'Example route',
    head: [],
    rows: [],
  },
];

describe('DecisionsController', () => {
  let controller: DecisionsController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecisionsController],
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

    controller = module.get<DecisionsController>(DecisionsController);
  });

  describe('index', () => {
    describe('when called by a service owner user', () => {
      it('presents all decision datasets', async () => {
        const request = createDefaultMockRequest();

        jest.spyOn(getActingUserModule, 'getActingUser').mockReturnValue(
          userFactory.build({
            serviceOwner: true,
            organisation: null,
          }),
        );

        const datasets = decisionDatasetFactory.buildList(3);

        decisionDatasetsService.all.mockResolvedValue(datasets);
        (
          DecisionDatasetsPresenter.prototype.present as jest.Mock
        ).mockResolvedValue(mockIndexTemplate);

        const result = await controller.index(request);

        expect(result).toEqual(mockIndexTemplate);

        expect(DecisionDatasetsPresenter).toHaveBeenCalledWith(
          null,
          datasets,
          i18nService,
        );
        expect(decisionDatasetsService.all).toHaveBeenCalled();
        expect(
          decisionDatasetsService.allForOrganisation,
        ).not.toHaveBeenCalled();
      });
    });

    describe('when called by a non-service owner user', () => {
      it("presents decision datasets for the user's organisation", async () => {
        const request = createDefaultMockRequest();

        const organisation = organisationFactory.build();

        jest.spyOn(getActingUserModule, 'getActingUser').mockReturnValue(
          userFactory.build({
            serviceOwner: false,
            organisation,
          }),
        );

        const datasets = decisionDatasetFactory.buildList(3);

        decisionDatasetsService.allForOrganisation.mockResolvedValue(datasets);
        (
          DecisionDatasetsPresenter.prototype.present as jest.Mock
        ).mockResolvedValue(mockIndexTemplate);

        const result = await controller.index(request);

        expect(result).toEqual(mockIndexTemplate);

        expect(DecisionDatasetsPresenter).toHaveBeenCalledWith(
          organisation,
          datasets,
          i18nService,
        );
        expect(decisionDatasetsService.allForOrganisation).toHaveBeenCalledWith(
          organisation,
        );
        expect(decisionDatasetsService.all).not.toHaveBeenCalled();
      });
    });
  });

  describe('export', () => {
    describe('when called by a service owner user', () => {
      it('exports a CSV file of all decision datasets', async () => {
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        jest.spyOn(getActingUserModule, 'getActingUser').mockReturnValue(
          userFactory.build({
            serviceOwner: true,
            organisation: null,
          }),
        );

        const datasets = decisionDatasetFactory.buildList(3);

        decisionDatasetsService.all.mockResolvedValue(datasets);

        await controller.export(request, response);

        expect(DecisionsCsvWriter).toHaveBeenCalledWith(
          response,
          'decisions',
          datasets,
          i18nService,
        );
        expect(DecisionsCsvWriter.prototype.write).toHaveBeenCalled();
        expect(decisionDatasetsService.all).toHaveBeenCalled();
        expect(
          decisionDatasetsService.allForOrganisation,
        ).not.toHaveBeenCalled();
      });
    });

    describe('when called by a non-service owner user', () => {
      it("exports a CSV file of all decision datasets for the user's organisation", async () => {
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const organisation = organisationFactory.build();

        jest.spyOn(getActingUserModule, 'getActingUser').mockReturnValue(
          userFactory.build({
            serviceOwner: false,
            organisation,
          }),
        );

        const datasets = decisionDatasetFactory.buildList(3);

        decisionDatasetsService.all.mockResolvedValue(datasets);

        await controller.export(request, response);

        expect(DecisionsCsvWriter).toHaveBeenCalledWith(
          response,
          'decisions',
          datasets,
          i18nService,
        );
        expect(DecisionsCsvWriter.prototype.write).toHaveBeenCalled();
        expect(decisionDatasetsService.allForOrganisation).toHaveBeenCalledWith(
          organisation,
        );
        expect(decisionDatasetsService.all).not.toHaveBeenCalled();
      });
    });
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

      const expected: ShowTemplate = {
        profession,
        organisation,
        tables: mockTables,
        year: 2017,
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
        dataset.routes,
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

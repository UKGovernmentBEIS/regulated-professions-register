import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { ProfessionsService } from '../../professions/professions.service';
import { ProfessionVersionsService } from '../../professions/profession-versions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import professionFactory from '../../testutils/factories/profession';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { DecisionsController } from './decisions.controller';
import { IndexTemplate } from './interfaces/index-template.interface';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';
import { DecisionsCsvWriter } from './helpers/decisions-csv-writer.helper';
import { Response } from 'express';
import { DecisionDatasetStatus } from '../decision-dataset.entity';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { FilterDto } from './dto/filter.dto';
import * as createFilterInputModule from '../../helpers/create-filter-input.helper';
import * as getDecisionsYearsRangeModule from './helpers/get-decisions-years-range';
import * as getQueryStringModule from '../../helpers/get-query-string.helper';
import * as getExportTimestampModule from './helpers/get-export-timestamp.helper';

jest.mock('./presenters/decision-datasets.presenter');
jest.mock('./helpers/decisions-csv-writer.helper');

const mockIndexTemplate: Omit<IndexTemplate, 'filterQuery'> = {
  view: 'overview',
  organisation: 'Example Organisation',
  decisionDatasetsTable: {
    head: [],
    rows: [],
  },
  filters: {
    keywords: 'example keywords',
    organisations: ['Organisation 1', 'Organisation 2'],
    years: [2020, 2021],
    statuses: [DecisionDatasetStatus.Live],
    professions: [],
  },
  organisationsCheckboxItems: [],
  yearsCheckboxItems: [],
  statusesCheckboxItems: [],
  professionsCheckboxItems: [],
};

describe('DecisionsController', () => {
  let controller: DecisionsController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
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
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
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

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(
            userFactory.build({
              serviceOwner: true,
              organisation: null,
            }),
          );

        const createFilterInputSpy = jest
          .spyOn(createFilterInputModule, 'createFilterInput')
          .mockReturnValue({
            keywords: 'example keywords',
          });

        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({
            start: 2020,
            end: 2024,
          });

        const getQueryStringSpy = jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('some&filter=query');

        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);

        decisionDatasetsService.all.mockResolvedValue(datasets);
        organisationVersionsService.allLive.mockResolvedValue(allOrganisations);

        (
          DecisionDatasetsPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockIndexTemplate);

        const filter: FilterDto = {
          keywords: 'example keywords',
          organisations: [],
          years: [],
          statuses: [],
          professions: [],
        };

        const result = await controller.index(request, filter);

        expect(result).toEqual({
          ...mockIndexTemplate,
          filterQuery: 'some&filter=query',
        } as IndexTemplate);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(createFilterInputSpy).toHaveBeenCalledWith({
          ...filter,
          allOrganisations,
          allProfessions: [],
        });
        expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        expect(getQueryStringSpy).toHaveBeenCalledWith(request);

        expect(DecisionDatasetsPresenter).toHaveBeenCalledWith(
          {
            keywords: 'example keywords',
          },
          null,
          allOrganisations,
          2020,
          2024,
          datasets,
          i18nService,
          [],
        );
        expect(
          DecisionDatasetsPresenter.prototype.present,
        ).toHaveBeenCalledWith('overview');
        expect(organisationVersionsService.allLive).toHaveBeenCalled();
        expect(decisionDatasetsService.all).toHaveBeenCalledWith({
          keywords: 'example keywords',
        });
        expect(
          decisionDatasetsService.allForOrganisation,
        ).not.toHaveBeenCalled();
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });
    });

    describe('when called by a non-service owner user', () => {
      it("presents decision datasets for the user's organisation", async () => {
        const request = createDefaultMockRequest();

        const userOrganisation = organisationFactory.build();

        const profession = professionFactory.build({
          name: 'Filtered Profession',
        });

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(
            userFactory.build({
              serviceOwner: false,
              organisation: userOrganisation,
            }),
          );

        const createFilterInputSpy = jest
          .spyOn(createFilterInputModule, 'createFilterInput')
          .mockReturnValue({
            keywords: 'example keywords',
            professions: [profession],
          });

        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({
            start: 2020,
            end: 2024,
          });

        const getQueryStringSpy = jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('some&filter=query');

        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);
        const allProfessions = professionFactory.buildList(3);

        decisionDatasetsService.allForOrganisation.mockResolvedValue(datasets);
        organisationVersionsService.allLive.mockResolvedValue(allOrganisations);
        professionVersionsService.allWithLatestVersionForOrganisation.mockResolvedValue(
          allProfessions,
        );

        (
          DecisionDatasetsPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockIndexTemplate);

        const filter: FilterDto = {
          keywords: 'example keywords',
          organisations: [],
          years: [],
          statuses: [],
          professions: [],
        };

        const result = await controller.index(request, filter);

        expect(result).toEqual({
          ...mockIndexTemplate,
          filterQuery: 'some&filter=query',
        } as IndexTemplate);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(createFilterInputSpy).toHaveBeenCalledWith({
          ...filter,
          allOrganisations,
          allProfessions,
        });
        expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        expect(getQueryStringSpy).toHaveBeenCalledWith(request);

        expect(DecisionDatasetsPresenter).toHaveBeenCalledWith(
          {
            keywords: 'example keywords',
            professions: [profession],
          },
          userOrganisation,
          allOrganisations,
          2020,
          2024,
          datasets,
          i18nService,
          allProfessions,
        );
        expect(
          DecisionDatasetsPresenter.prototype.present,
        ).toHaveBeenCalledWith('single-organisation');
        expect(organisationVersionsService.allLive).toHaveBeenCalled();
        expect(decisionDatasetsService.allForOrganisation).toHaveBeenCalledWith(
          userOrganisation,
          {
            keywords: 'example keywords',
            professions: [profession],
          },
        );
        expect(decisionDatasetsService.all).not.toHaveBeenCalled();
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).toHaveBeenCalledWith(userOrganisation);
      });
    });
  });

  describe('export', () => {
    describe('when called by a service owner user', () => {
      it('exports a CSV file of all decision datasets', async () => {
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(
            userFactory.build({
              serviceOwner: true,
              organisation: null,
            }),
          );

        const createFilterInputSpy = jest
          .spyOn(createFilterInputModule, 'createFilterInput')
          .mockReturnValue({
            keywords: 'example keywords',
          });

        const getExportTimestampSpy = jest
          .spyOn(getExportTimestampModule, 'getExportTimestamp')
          .mockReturnValue('20240525');

        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);

        decisionDatasetsService.allForOrganisation.mockResolvedValue(datasets);
        organisationVersionsService.allLive.mockResolvedValue(allOrganisations);

        const filter: FilterDto = {
          keywords: 'example keywords',
          organisations: [],
          years: [],
          statuses: [],
          professions: [],
        };

        await controller.export(request, response, filter);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(createFilterInputSpy).toHaveBeenCalledWith({
          ...filter,
          allOrganisations,
          allProfessions: [],
        });
        expect(getExportTimestampSpy).toHaveBeenCalled();

        expect(DecisionsCsvWriter).toHaveBeenCalledWith(
          response,
          'decisions-20240525',
          datasets,
          i18nService,
        );
        expect(DecisionsCsvWriter.prototype.write).toHaveBeenCalled();
        expect(organisationVersionsService.allLive).toHaveBeenCalled();
        expect(decisionDatasetsService.all).toHaveBeenCalledWith({
          keywords: 'example keywords',
        });
        expect(
          decisionDatasetsService.allForOrganisation,
        ).not.toHaveBeenCalled();
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });
    });

    describe('when called by a non-service owner user', () => {
      it("exports a CSV file of all decision datasets for the user's organisation", async () => {
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const userOrganisation = organisationFactory.build();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(
            userFactory.build({
              serviceOwner: false,
              organisation: userOrganisation,
            }),
          );

        const createFilterInputSpy = jest
          .spyOn(createFilterInputModule, 'createFilterInput')
          .mockReturnValue({
            keywords: 'example keywords',
          });

        const getExportTimestampSpy = jest
          .spyOn(getExportTimestampModule, 'getExportTimestamp')
          .mockReturnValue('20240525');

        const datasets = decisionDatasetFactory.buildList(3);
        const allOrganisations = organisationFactory.buildList(3);
        const allProfessions = professionFactory.buildList(3);

        decisionDatasetsService.allForOrganisation.mockResolvedValue(datasets);
        organisationVersionsService.allLive.mockResolvedValue(allOrganisations);

        const filter: FilterDto = {
          keywords: 'example keywords',
          organisations: [],
          years: [],
          statuses: [],
          professions: [],
        };

        await controller.export(request, response, filter);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(createFilterInputSpy).toHaveBeenCalledWith({
          ...filter,
          allOrganisations,
          allProfessions,
        });
        expect(getExportTimestampSpy).toHaveBeenCalled();

        expect(DecisionsCsvWriter).toHaveBeenCalledWith(
          response,
          'decisions-20240525',
          datasets,
          i18nService,
        );
        expect(DecisionsCsvWriter.prototype.write).toHaveBeenCalled();
        expect(organisationVersionsService.allLive).toHaveBeenCalled();
        expect(decisionDatasetsService.allForOrganisation).toHaveBeenCalledWith(
          userOrganisation,
          {
            keywords: 'example keywords',
          },
        );
        expect(decisionDatasetsService.all).not.toHaveBeenCalled();
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).toHaveBeenCalledWith(userOrganisation);
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

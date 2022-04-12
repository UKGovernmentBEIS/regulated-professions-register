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
import * as checkCanViewOrganisationModule from '../../users/helpers/check-can-view-organisation';
import * as checkCanChangeProfessionModule from '../../users/helpers/check-can-change-profession';
import * as getActingUserModule from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { DecisionsController } from './decisions.controller';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';

jest.mock('./presenters/decision-datasets.presenter');
jest.mock('../presenters/decision-dataset.presenter');

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

  let decisionsDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionsDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecisionsController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionsDatasetsService,
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

        decisionsDatasetsService.all.mockResolvedValue(datasets);
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
        expect(decisionsDatasetsService.all).toHaveBeenCalled();
        expect(
          decisionsDatasetsService.allForOrganisation,
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

        decisionsDatasetsService.allForOrganisation.mockResolvedValue(datasets);
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
        expect(
          decisionsDatasetsService.allForOrganisation,
        ).toHaveBeenCalledWith(organisation);
        expect(decisionsDatasetsService.all).not.toHaveBeenCalled();
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

      const professionCheckSpy = jest
        .spyOn(checkCanChangeProfessionModule, 'checkCanChangeProfession')
        .mockImplementation();
      const organisationCheckSpy = jest
        .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
        .mockImplementation();

      professionsService.findWithVersions.mockResolvedValueOnce(profession);
      decisionsDatasetsService.find.mockResolvedValue(dataset);

      (DecisionDatasetPresenter.prototype.tables as jest.Mock).mockReturnValue(
        mockTables,
      );

      const expected: ShowTemplate = {
        profession,
        organisation,
        tables: mockTables,
        year: '2017',
      };

      const result = await controller.show(
        'example-profession-id',
        'example-organisation-id',
        '2017',
        request,
      );

      expect(result).toEqual(expected);

      expect(professionCheckSpy).toHaveBeenCalledWith(request, profession);
      expect(organisationCheckSpy).toHaveBeenCalledWith(request, organisation);

      expect(professionsService.findWithVersions).toHaveBeenCalledWith(
        'example-profession-id',
      );
      expect(decisionsDatasetsService.find).toHaveBeenCalledWith(
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

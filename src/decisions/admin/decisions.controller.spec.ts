import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Table } from '../../common/interfaces/table';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import userFactory from '../../testutils/factories/user';
import * as checkCanViewOrganisationModule from '../../users/helpers/check-can-view-organisation';
import * as checkCanViewProfessionModule from '../../users/helpers/check-can-view-profession';
import * as getActingUserModule from '../../users/helpers/get-acting-user.helper';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { DecisionsController } from './decisions.controller';
import { EditDto } from './dto/edit.dto';
import * as parseDecisionValueModule from './helpers/parse-decision-value.helper';
import { EditTemplate } from './interfaces/edit-template.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { RouteTemplate } from './interfaces/route-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';

jest.mock('./presenters/decision-datasets.presenter');
jest.mock('../presenters/decision-dataset.presenter');
jest.mock('./presenters/decision-dataset-edit.presenter');

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

const mockRouteTemplates: RouteTemplate[] = [
  {
    name: 'Example route',
    countries: [
      {
        countrySelectArgs: [],
        decisions: {
          yes: '5',
          no: '8',
          yesAfterComp: '11',
          noAfterComp: '2',
        },
      },
    ],
  },
];

describe('DecisionsController', () => {
  let controller: DecisionsController;

  let decisionsDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionsDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
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
          provide: OrganisationsService,
          useValue: organisationsService,
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
        .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
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

  describe('edit', () => {
    describe('when the dataset exists', () => {
      it('presents the dataset for editing', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const dataset = decisionDatasetFactory.build({
          profession,
          organisation,
          year: 2016,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionsDatasetsService.find.mockResolvedValue(dataset);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: '2016',
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          '2016',
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionsDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          dataset.routes,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
      });
    });

    describe('when the dataset does not exist', () => {
      it('presents a default empty dataset for editing', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionsDatasetsService.find.mockResolvedValue(null);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: '2016',
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          '2016',
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionsDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith([
          {
            name: '',
            countries: [
              {
                country: null,
                decisions: {
                  yes: null,
                  no: null,
                  yesAfterComp: null,
                  noAfterComp: null,
                },
              },
            ],
          },
        ] as DecisionRoute[]);
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
      });
    });
  });

  describe('editPost', () => {
    describe('when the `action` is "removeCountry"', () => {
      it('removes the given country from the given route in the given dataset', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [['Italy'], ['Japan', 'Germany']],
          yeses: [['7'], ['1', '5']],
          noes: [['4'], ['3', '6']],
          yesAfterComps: [['3'], ['5', '12']],
          noAfterComps: [['5'], ['8', '']],
          action: 'removeCountry:2:1',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2017',
          editDto,
          request,
          response,
        );

        expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
          profession,
          organisation,
          year: '2017',
          routes: mockRouteTemplates,
        } as EditTemplate);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith([
          {
            name: 'Example route 1',
            countries: [
              {
                country: 'Italy',
                decisions: {
                  yes: 7,
                  no: 4,
                  yesAfterComp: 3,
                  noAfterComp: 5,
                },
              },
            ],
          },
          {
            name: 'Example route 2',
            countries: [
              {
                country: 'Germany',
                decisions: {
                  yes: 5,
                  no: 6,
                  yesAfterComp: 12,
                  noAfterComp: null,
                },
              },
            ],
          },
        ] as DecisionRoute[]);
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(12);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(3, '3');
      });
    });

    describe('when the `action` is "addCountry"', () => {
      it('adds a default empty country to the given route in the given dataset', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [['Canada', 'Belgium'], ['Morocco']],
          yeses: [['9', '5'], ['1']],
          noes: [['2', '6'], ['2']],
          yesAfterComps: [['5', ''], ['5']],
          noAfterComps: [['8', '3'], ['4']],
          action: 'addCountry:1',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2017',
          editDto,
          request,
          response,
        );

        expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
          profession,
          organisation,
          year: '2017',
          routes: mockRouteTemplates,
        } as EditTemplate);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith([
          {
            name: 'Example route 1',
            countries: [
              {
                country: 'Canada',
                decisions: {
                  yes: 9,
                  no: 2,
                  yesAfterComp: 5,
                  noAfterComp: 8,
                },
              },
              {
                country: 'Belgium',
                decisions: {
                  yes: 5,
                  no: 6,
                  yesAfterComp: null,
                  noAfterComp: 3,
                },
              },
              {
                country: null,
                decisions: {
                  yes: null,
                  no: null,
                  yesAfterComp: null,
                  noAfterComp: null,
                },
              },
            ],
          },
          {
            name: 'Example route 2',
            countries: [
              {
                country: 'Morocco',
                decisions: {
                  yes: 1,
                  no: 2,
                  yesAfterComp: 5,
                  noAfterComp: 4,
                },
              },
            ],
          },
        ] as DecisionRoute[]);
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(12);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(4, '8');
      });
    });

    describe('when the `action` is "removeRoute"', () => {
      it('removes the given route from the given dataset', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [
            ['Japan', 'Canada'],
            ['Morocco', 'France'],
          ],
          yeses: [
            ['9', '6'],
            ['1', '1'],
          ],
          noes: [
            ['', '7'],
            ['3', '4'],
          ],
          yesAfterComps: [
            ['5', '9'],
            ['3', '5'],
          ],
          noAfterComps: [
            ['1', '3'],
            ['4', '8'],
          ],
          action: 'removeRoute:2',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2017',
          editDto,
          request,
          response,
        );

        expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
          profession,
          organisation,
          year: '2017',
          routes: mockRouteTemplates,
        } as EditTemplate);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith([
          {
            name: 'Example route 1',
            countries: [
              {
                country: 'Japan',
                decisions: {
                  yes: 9,
                  no: null,
                  yesAfterComp: 5,
                  noAfterComp: 1,
                },
              },
              {
                country: 'Canada',
                decisions: {
                  yes: 6,
                  no: 7,
                  yesAfterComp: 9,
                  noAfterComp: 3,
                },
              },
            ],
          },
        ] as DecisionRoute[]);
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(16);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(9, '1');
      });
    });

    describe('when the `action` is "addRoute"', () => {
      it('adds a default empty route the dataset', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [
            ['Poland', 'Brazil'],
            ['Italy', 'Canada'],
          ],
          yeses: [
            ['9', '1'],
            ['1', '5'],
          ],
          noes: [
            ['1', '8'],
            ['6', '5'],
          ],
          yesAfterComps: [
            ['3', '4'],
            ['7', ''],
          ],
          noAfterComps: [
            ['7', '8'],
            ['4', '6'],
          ],
          action: 'addRoute',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2017',
          editDto,
          request,
          response,
        );

        expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
          profession,
          organisation,
          year: '2017',
          routes: mockRouteTemplates,
        } as EditTemplate);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith([
          {
            name: 'Example route 1',
            countries: [
              {
                country: 'Poland',
                decisions: {
                  yes: 9,
                  no: 1,
                  yesAfterComp: 3,
                  noAfterComp: 7,
                },
              },
              {
                country: 'Brazil',
                decisions: {
                  yes: 1,
                  no: 8,
                  yesAfterComp: 4,
                  noAfterComp: 8,
                },
              },
            ],
          },
          {
            name: 'Example route 2',
            countries: [
              {
                country: 'Italy',
                decisions: {
                  yes: 1,
                  no: 6,
                  yesAfterComp: 7,
                  noAfterComp: 4,
                },
              },
              {
                country: 'Canada',
                decisions: {
                  yes: 5,
                  no: 5,
                  yesAfterComp: null,
                  noAfterComp: 6,
                },
              },
            ],
          },
          {
            name: '',
            countries: [
              {
                country: null,
                decisions: {
                  yes: null,
                  no: null,
                  yesAfterComp: null,
                  noAfterComp: null,
                },
              },
            ],
          },
        ] as DecisionRoute[]);
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(16);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(8, '8');
      });
    });

    describe('when the `action` is "publish"', () => {
      it('saves the given dataset with the published status', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const user = userFactory.build();

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [['France', 'Belgium'], ['Canada']],
          yeses: [['1', '7'], ['8']],
          noes: [['8', '4'], ['6']],
          yesAfterComps: [['1', '6'], ['9']],
          noAfterComps: [['2', '3'], ['1']],
          action: 'publish',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2016',
          editDto,
          request,
          response,
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/example-profession-id/example-organisation-id/2016',
        );

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionsDatasetsService.save).toHaveBeenCalledWith({
          profession,
          organisation,
          year: 2016,
          user,
          status: DecisionDatasetStatus.Live,
          routes: [
            {
              name: 'Example route 1',
              countries: [
                {
                  country: 'France',
                  decisions: {
                    yes: 1,
                    no: 8,
                    yesAfterComp: 1,
                    noAfterComp: 2,
                  },
                },
                {
                  country: 'Belgium',
                  decisions: {
                    yes: 7,
                    no: 4,
                    yesAfterComp: 6,
                    noAfterComp: 3,
                  },
                },
              ],
            },
            {
              name: 'Example route 2',
              countries: [
                {
                  country: 'Canada',
                  decisions: {
                    yes: 8,
                    no: 6,
                    yesAfterComp: 9,
                    noAfterComp: 1,
                  },
                },
              ],
            },
          ],
        } as DecisionDataset);

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(12);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(11, '9');
      });
    });

    describe('when the `action` is "save"', () => {
      it('saves the given dataset with the draft status', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const user = userFactory.build();

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);

        const checkCanViewProfessionSpy = jest
          .spyOn(checkCanViewProfessionModule, 'checkCanViewProfession')
          .mockImplementation();
        const checkCanViewOrganisationSpy = jest
          .spyOn(checkCanViewOrganisationModule, 'checkCanViewOrganisation')
          .mockImplementation();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const parseDecisionValueSpy = jest.spyOn(
          parseDecisionValueModule,
          'parseDecisionValue',
        );

        const editDto: EditDto = {
          routes: ['Example route 1', 'Example route 2'],
          countries: [['Italy', 'Poland'], ['Japan']],
          yeses: [['7', '4'], ['1']],
          noes: [['4', '10'], ['3']],
          yesAfterComps: [['', '3'], ['5']],
          noAfterComps: [['5', '7'], ['8']],
          action: 'save',
        };
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          '2016',
          editDto,
          request,
          response,
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/example-profession-id/example-organisation-id/2016',
        );

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionsDatasetsService.save).toHaveBeenCalledWith({
          profession,
          organisation,
          year: 2016,
          user,
          status: DecisionDatasetStatus.Draft,
          routes: [
            {
              name: 'Example route 1',
              countries: [
                {
                  country: 'Italy',
                  decisions: {
                    yes: 7,
                    no: 4,
                    yesAfterComp: null,
                    noAfterComp: 5,
                  },
                },
                {
                  country: 'Poland',
                  decisions: {
                    yes: 4,
                    no: 10,
                    yesAfterComp: 3,
                    noAfterComp: 7,
                  },
                },
              ],
            },
            {
              name: 'Example route 2',
              countries: [
                {
                  country: 'Japan',
                  decisions: {
                    yes: 1,
                    no: 3,
                    yesAfterComp: 5,
                    noAfterComp: 8,
                  },
                },
              ],
            },
          ],
        } as DecisionDataset);

        expect(checkCanViewProfessionSpy).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(checkCanViewOrganisationSpy).toHaveBeenCalledWith(
          request,
          organisation,
        );
        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(parseDecisionValueSpy).toHaveBeenCalledTimes(12);
        expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(7, '3');
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

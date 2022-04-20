import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Table } from '../../common/interfaces/table';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionVersionsService } from '../../professions/profession-versions.service';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import userFactory from '../../testutils/factories/user';
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
import * as parseEditDtoDecisionRoutesModule from './helpers/parse-edit-dto-decision-routes.helper';
import * as modifyDecisionRoutesModule from './helpers/modify-decision-routes.helper';
import { EditTemplate } from './interfaces/edit-template.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { RouteTemplate } from './interfaces/route-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';
import professionVersionFactory from '../../testutils/factories/profession-version';
import * as getDecisionsYearsRangeModule from './helpers/get-decisions-years-range';
import { NewDecisionDatasetPresenter } from './presenters/new-decision-dataset.presenter';
import { Profession } from '../../professions/profession.entity';
import { NewTemplate } from './interfaces/new-template.interface';
import { NewDto } from './dto/new.dto';
import * as getOrganisationsFromProfessionModule from '../../professions/helpers/get-organisations-from-profession.helper';
import * as checkCanChangeDatasetModule from './helpers/check-can-change-dataset.helper';

jest.mock('./presenters/decision-datasets.presenter');
jest.mock('../presenters/decision-dataset.presenter');
jest.mock('./presenters/decision-dataset-edit.presenter');
jest.mock('./presenters/new-decision-dataset.presenter');

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
        countriesSelectArgs: [],
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

const mockNewTemplate: NewTemplate = {
  professionsSelectArgs: [
    {
      text: 'Example Profession',
      value: 'example-profession',
      selected: false,
    },
  ],
  organisationsSelectArgs: [
    {
      text: 'Example Organisation',
      value: 'example-organisation',
      selected: false,
    },
  ],
  yearsSelectArgs: [
    {
      text: '2022',
      value: '2022',
      selected: false,
    },
  ],
};

describe('DecisionsController', () => {
  let controller: DecisionsController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
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
          provide: OrganisationsService,
          useValue: organisationsService,
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

  describe('new', () => {
    describe('when the user is a service owner', () => {
      it('returns a populated NewTemplate', async () => {
        const user = userFactory.build({
          serviceOwner: true,
        });

        const professionVersions = professionVersionFactory.buildList(5);
        const organisations = organisationFactory.buildList(5);

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({ start: 2020, end: 2024 });

        professionVersionsService.allLive.mockResolvedValue(professionVersions);

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.new(request, response);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();

        expect(professionVersionsService.allLive).toHaveBeenCalled();
        expect(
          professionVersionsService.allLiveForOrganisation,
        ).not.toHaveBeenCalled();

        expect(organisationVersionsService.allLive).toHaveBeenCalled();

        expect(NewDecisionDatasetPresenter).toHaveBeenCalledWith(
          professionVersions.map((version) =>
            Profession.withVersion(version.profession, version),
          ),
          organisations,
          2020,
          2024,
          null,
          null,
          null,
          i18nService,
        );
        expect(
          NewDecisionDatasetPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/decisions/new',
          mockNewTemplate,
        );
      });
    });

    describe('when the user is not a service owner', () => {
      it('returns a populated NewTemplate', async () => {
        const userOrganisation = organisationFactory.build();

        const user = userFactory.build({
          serviceOwner: false,
          organisation: userOrganisation,
        });

        const professionVersions = professionVersionFactory.buildList(5);

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getDecisionsEndYearSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({ start: 2020, end: 2024 });

        professionVersionsService.allLiveForOrganisation.mockResolvedValue(
          professionVersions,
        );

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.new(request, response);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getDecisionsEndYearSpy).toHaveBeenCalled();

        expect(professionVersionsService.allLive).not.toHaveBeenCalled();
        expect(
          professionVersionsService.allLiveForOrganisation,
        ).toHaveBeenCalledWith(userOrganisation);

        expect(organisationVersionsService.allLive).not.toHaveBeenCalled();

        expect(NewDecisionDatasetPresenter).toHaveBeenCalledWith(
          professionVersions.map((version) =>
            Profession.withVersion(version.profession, version),
          ),
          null,
          2020,
          2024,
          null,
          null,
          null,
          i18nService,
        );
        expect(
          NewDecisionDatasetPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/decisions/new',
          mockNewTemplate,
        );
      });
    });
  });

  describe('newPost', () => {
    describe('when a service owner submits a valid DTO', () => {
      it('redirects to the edit page', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'organisation-id',
        });

        const user = userFactory.build({
          serviceOwner: true,
        });

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const newDto: NewDto = {
          serviceOwner: true,
          profession: 'profession-id',
          organisation: 'organisation-id',
          year: '2023',
        };

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest
          .spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          )
          .mockReturnValue([organisation]);

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(null);

        await controller.newPost(request, response, newDto);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
          profession,
        );

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'profession-id',
        );
        expect(organisationsService.find).toBeCalledWith('organisation-id');
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'profession-id',
          'organisation-id',
          2023,
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/profession-id/organisation-id/2023/edit',
        );
      });
    });

    describe('when a non-service owner submits a valid DTO', () => {
      it('redirects to the edit page', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });

        const userOrganisation = organisationFactory.build({
          id: 'organisation-id',
        });

        const user = userFactory.build({
          serviceOwner: false,
          organisation: userOrganisation,
        });

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const newDto: NewDto = {
          serviceOwner: false,
          profession: 'profession-id',
          organisation: undefined,
          year: '2023',
        };

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest
          .spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          )
          .mockReturnValue([userOrganisation]);

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(userOrganisation);
        decisionDatasetsService.find.mockResolvedValue(null);

        await controller.newPost(request, response, newDto);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
          profession,
        );

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'profession-id',
        );
        expect(organisationsService.find).toBeCalledWith('organisation-id');
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'profession-id',
          'organisation-id',
          2023,
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/profession-id/organisation-id/2023/edit',
        );
      });
    });

    describe('when a user submits a DTO with missing fields', () => {
      it('returns a NewTemplate populated with errors', async () => {
        const professionVersions = professionVersionFactory.buildList(5);
        const organisations = organisationFactory.buildList(5);

        const user = userFactory.build({
          serviceOwner: true,
        });

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const newDto: NewDto = {
          serviceOwner: true,
          profession: '',
          organisation: '',
          year: '',
        };

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest.spyOn(
          getOrganisationsFromProfessionModule,
          'getOrganisationsFromProfession',
        );
        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({ start: 2020, end: 2024 });

        professionVersionsService.allLive.mockResolvedValue(professionVersions);
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.newPost(request, response, newDto);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).not.toHaveBeenCalled();

        expect(getDecisionsYearsRangeSpy).toBeCalled();

        expect(professionsService.findWithVersions).not.toHaveBeenCalled();
        expect(organisationsService.find).not.toHaveBeenCalled();
        expect(decisionDatasetsService.find).not.toHaveBeenCalled();

        expect(professionVersionsService.allLive).toHaveBeenCalled();
        expect(organisationVersionsService.allLive).toHaveBeenCalled();

        expect(NewDecisionDatasetPresenter).toHaveBeenCalledWith(
          professionVersions.map((version) =>
            Profession.withVersion(version.profession, version),
          ),
          organisations,
          2020,
          2024,
          null,
          null,
          null,
          i18nService,
        );
        expect(
          NewDecisionDatasetPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith('admin/decisions/new', {
          ...mockNewTemplate,
          errors: {
            organisation: {
              text: 'decisions.admin.new.errors.organisation.empty',
            },
            profession: {
              text: 'decisions.admin.new.errors.profession.empty',
            },
            year: {
              text: 'decisions.admin.new.errors.year.empty',
            },
          },
        });
      });
    });

    describe('when a user submits a DTO for a dataset that already exists', () => {
      it('returns a NewTemplate populated with errors', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });
        const organisation = organisationFactory.build({
          id: 'organisation-id',
        });
        const dataset = decisionDatasetFactory.build({
          organisation,
          profession,
          year: 2020,
        });

        const professionVersions = professionVersionFactory.buildList(5);
        const organisations = organisationFactory.buildList(5);

        const user = userFactory.build({
          serviceOwner: true,
        });

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const newDto: NewDto = {
          serviceOwner: true,
          profession: 'profession-id',
          organisation: 'organisation-id',
          year: '2020',
        };

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest
          .spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          )
          .mockReturnValue([organisation]);
        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({ start: 2020, end: 2024 });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(dataset);

        professionVersionsService.allLive.mockResolvedValue(professionVersions);
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.newPost(request, response, newDto);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).toHaveBeenCalled();

        expect(getDecisionsYearsRangeSpy).toBeCalled();

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'profession-id',
          'organisation-id',
          2020,
        );

        expect(professionVersionsService.allLive).toHaveBeenCalled();
        expect(organisationVersionsService.allLive).toHaveBeenCalled();

        expect(NewDecisionDatasetPresenter).toHaveBeenCalledWith(
          professionVersions.map((version) =>
            Profession.withVersion(version.profession, version),
          ),
          organisations,
          2020,
          2024,
          profession,
          organisation,
          2020,
          i18nService,
        );
        expect(
          NewDecisionDatasetPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith('admin/decisions/new', {
          ...mockNewTemplate,
          errors: {
            year: {
              text: 'decisions.admin.new.errors.year.exists',
            },
          },
        });
      });
    });

    describe('when a user submits a DTO with an invalid organisation for the profession', () => {
      it('returns a NewTemplate populated with errors', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });
        const organisation = organisationFactory.build({
          id: 'organisation-id',
        });
        const otherOrganisation = organisationFactory.build({
          id: 'other-organisation-id',
        });

        const professionVersions = professionVersionFactory.buildList(5);
        const organisations = organisationFactory.buildList(5);

        const user = userFactory.build({
          serviceOwner: true,
        });

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        const newDto: NewDto = {
          serviceOwner: true,
          profession: 'profession-id',
          organisation: 'organisation-id',
          year: '2020',
        };

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest
          .spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          )
          .mockReturnValue([otherOrganisation]);
        const getDecisionsYearsRangeSpy = jest
          .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
          .mockReturnValue({ start: 2020, end: 2024 });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(null);

        professionVersionsService.allLive.mockResolvedValue(professionVersions);
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.newPost(request, response, newDto);

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).toHaveBeenCalled();

        expect(getDecisionsYearsRangeSpy).toBeCalled();

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'profession-id',
          'organisation-id',
          2020,
        );

        expect(professionVersionsService.allLive).toHaveBeenCalled();
        expect(organisationVersionsService.allLive).toHaveBeenCalled();

        expect(NewDecisionDatasetPresenter).toHaveBeenCalledWith(
          professionVersions.map((version) =>
            Profession.withVersion(version.profession, version),
          ),
          organisations,
          2020,
          2024,
          profession,
          organisation,
          2020,
          i18nService,
        );
        expect(
          NewDecisionDatasetPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith('admin/decisions/new', {
          ...mockNewTemplate,
          errors: {
            organisation: {
              text: 'decisions.admin.new.errors.organisation.notValidForProfession',
            },
          },
        });
      });
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
        decisionDatasetsService.find.mockResolvedValue(dataset);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: 2016,
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          2016,
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          dataset.routes,
          i18nService,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          true,
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
        decisionDatasetsService.find.mockResolvedValue(null);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: 2016,
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          2016,
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          [
            {
              name: '',
              countries: [
                {
                  code: null,
                  decisions: {
                    yes: null,
                    no: null,
                    yesAfterComp: null,
                    noAfterComp: null,
                  },
                },
              ],
            },
          ] as DecisionRoute[],
          i18nService,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          false,
        );
      });
    });
  });

  describe('editPost', () => {
    describe('when the `action` is "publish"', () => {
      it('saves the given dataset with the published status', async () => {
        const editDto: EditDto = {
          routes: ['Example route'],
          countries: [['Brazil']],
          yeses: [['1']],
          noes: [['5']],
          yesAfterComps: [['4']],
          noAfterComps: [['7']],
          action: 'publish',
        };

        const decisionRoutes: DecisionRoute[] = [
          {
            name: 'Example route',
            countries: [
              {
                code: 'BR',
                decisions: {
                  yes: 1,
                  no: 5,
                  yesAfterComp: 5,
                  noAfterComp: 7,
                },
              },
            ],
          },
        ];

        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const user = userFactory.build();

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(undefined);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);

        const parseEditDtoDecisionRoutesSpy = jest
          .spyOn(parseEditDtoDecisionRoutesModule, 'parseEditDtoDecisionRoutes')
          .mockReturnValue(decisionRoutes);
        const modifyDecisionRoutesSpy = jest.spyOn(
          modifyDecisionRoutesModule,
          'modifyDecisionRoutes',
        );

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          2016,
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
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(decisionDatasetsService.save).toHaveBeenCalledWith({
          profession,
          organisation,
          year: 2016,
          user,
          status: DecisionDatasetStatus.Live,
          routes: decisionRoutes,
        } as DecisionDataset);

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          false,
        );
        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
        expect(modifyDecisionRoutesSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the `action` is "save"', () => {
      it('saves the given dataset with the draft status', async () => {
        const editDto: EditDto = {
          routes: ['Example route'],
          countries: [['Germany']],
          yeses: [['1']],
          noes: [['8']],
          yesAfterComps: [['1']],
          noAfterComps: [['2']],
          action: 'save',
        };

        const decisionRoutes: DecisionRoute[] = [
          {
            name: 'Example route',
            countries: [
              {
                code: 'DE',
                decisions: {
                  yes: 1,
                  no: 8,
                  yesAfterComp: 1,
                  noAfterComp: 2,
                },
              },
            ],
          },
        ];

        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const user = userFactory.build();

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(undefined);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);

        const parseEditDtoDecisionRoutesSpy = jest
          .spyOn(parseEditDtoDecisionRoutesModule, 'parseEditDtoDecisionRoutes')
          .mockReturnValue(decisionRoutes);
        const modifyDecisionRoutesSpy = jest.spyOn(
          modifyDecisionRoutesModule,
          'modifyDecisionRoutes',
        );

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          2016,
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
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(decisionDatasetsService.save).toHaveBeenCalledWith({
          profession,
          organisation,
          year: 2016,
          user,
          status: DecisionDatasetStatus.Draft,
          routes: decisionRoutes,
        } as DecisionDataset);

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          false,
        );
        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
        expect(modifyDecisionRoutesSpy).not.toHaveBeenCalled();
      });
    });

    describe('when the `action` is a modification command', () => {
      it('modifies the dataset', async () => {
        const editDto: EditDto = {
          routes: ['Example route'],
          countries: [['Japan']],
          yeses: [['4']],
          noes: [['5']],
          yesAfterComps: [['']],
          noAfterComps: [['9']],
          action: 'addCountry:1',
        };

        const decisionRoutes: DecisionRoute[] = [
          {
            name: 'Example route',
            countries: [
              {
                code: 'JP',
                decisions: {
                  yes: 4,
                  no: 5,
                  yesAfterComp: null,
                  noAfterComp: 9,
                },
              },
            ],
          },
        ];

        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(undefined);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const parseEditDtoDecisionRoutesSpy = jest
          .spyOn(parseEditDtoDecisionRoutesModule, 'parseEditDtoDecisionRoutes')
          .mockReturnValue(decisionRoutes);
        const modifyDecisionRoutesSpy = jest
          .spyOn(modifyDecisionRoutesModule, 'modifyDecisionRoutes')
          .mockImplementation();

        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await controller.editPost(
          'example-profession-id',
          'example-organisation-id',
          2017,
          editDto,
          request,
          response,
        );

        expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
          profession,
          organisation,
          year: 2017,
          routes: mockRouteTemplates,
        } as EditTemplate);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2017,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          decisionRoutes,
          i18nService,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2017,
          false,
        );
        expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
        expect(modifyDecisionRoutesSpy).toHaveBeenCalledWith(
          decisionRoutes,
          'addCountry:1',
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
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
import { DecisionDatasetsService } from '../decision-datasets.service';
import professionVersionFactory from '../../testutils/factories/profession-version';
import * as getDecisionsYearsRangeModule from './helpers/get-decisions-years-range';
import { NewDecisionDatasetPresenter } from './presenters/new-decision-dataset.presenter';
import { Profession } from '../../professions/profession.entity';
import { NewTemplate } from './interfaces/new-template.interface';
import { NewDto } from './dto/new.dto';
import * as getOrganisationsFromProfessionModule from '../../professions/helpers/get-organisations-from-profession.helper';
import { NewController } from './new.controller';

jest.mock('./presenters/new-decision-dataset.presenter');

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

describe('NewController', () => {
  let controller: NewController;

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
      controllers: [NewController],
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

    controller = module.get<NewController>(NewController);
  });

  describe('edit', () => {
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
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        (
          NewDecisionDatasetPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockNewTemplate);

        await controller.edit(request, response);

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

        await controller.edit(request, response);

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

  describe('update', () => {
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

        await controller.update(request, response, newDto);

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

        await controller.update(request, response, newDto);

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

        await controller.update(request, response, newDto);

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

        await controller.update(request, response, newDto);

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

        await controller.update(request, response, newDto);

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

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

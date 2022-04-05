import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { TopLevelInformationController } from './top-level-information.controller';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';

jest.mock('../../users/helpers/check-can-view-profession');

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let response: DeepMocked<Response>;
  let i18nService: I18nService;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: OrganisationsService, useValue: organisationsService },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should render a blank name to be displayed', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(blankProfession);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: undefined,
            captionText: translationOf('professions.form.captions.add'),
          }),
        );
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-fill the Profession name', async () => {
        const profession = professionFactory.build({
          name: 'Example Profession',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: 'Example Profession',
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );
      });

      it('checks the acting user has permission to view the page', async () => {
        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        const profession = professionFactory.build();

        professionsService.findWithVersions.mockResolvedValue(profession);

        await controller.edit(response, 'profession-id', 'false', request);

        expect(checkCanViewProfession).toHaveBeenCalledWith(
          request,
          profession,
        );
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the check your answers page', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(profession);

        const topLevelDetailsDto = {
          name: 'Gas Safe Engineer',
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          topLevelDetailsDto,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            name: 'Gas Safe Engineer',
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not create a profession, and re-renders the top level information view and an error', async () => {
        const topLevelDetailsDtoWithNoAnswers = {
          name: '',
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          topLevelDetailsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            errors: {
              name: {
                text: 'professions.form.errors.name.empty',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    it('checks the acting user has permission to update the Profession', async () => {
      const profession = professionFactory.build();

      const topLevelDetailsDto = {
        name: 'Gas Safe Engineer',
      };

      professionsService.findWithVersions.mockResolvedValue(profession);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        topLevelDetailsDto,
        response,
        'profession-id',
        'false',
        request,
      );

      expect(checkCanViewProfession).toHaveBeenCalledWith(request, profession);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

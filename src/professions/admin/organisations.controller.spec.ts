import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { RegulatedAuthoritiesSelectPresenter } from './presenters/regulated-authorities-select-presenter';
import { OrganisationsController } from './organisations.controller';
import { when } from 'jest-when';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';

jest.mock('../../users/helpers/check-can-view-profession');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
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
      controllers: [OrganisationsController],
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

    controller = module.get<OrganisationsController>(OrganisationsController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should a list of Organisations to be displayed in the Selects with none of them selected', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(blankProfession);

        const organisations = organisationFactory.buildList(2);
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(organisations, null);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            captionText: translationOf('professions.form.captions.add'),
          }),
        );
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-fill both Organisations', async () => {
        const organisation = organisationFactory.build({
          name: 'Example org',
          id: 'example-org-id',
        });
        const additionalOrganisation = organisationFactory.build({
          name: 'Example org 2',
          id: 'example-org-id-2',
        });

        const profession = professionFactory.build(
          {
            name: 'Example Profession',
          },
          {
            transient: {
              organisations: [organisation, additionalOrganisation],
            },
          },
        );

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisations = [
          organisation,
          additionalOrganisation,
          organisationFactory.build(),
        ];
        organisationVersionsService.allLive.mockResolvedValue(organisations);
        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(organisations, organisation);

        const regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            additionalOrganisation,
          );

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation.selectArgs(),
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

        const organisationsDto = {
          regulatoryBody: 'example-org-id',
          additionalRegulatoryBody: 'other-example-org-id',
        };

        const newOrganisation = organisationFactory.build({
          name: 'Council of Gas Safe Engineers',
        });

        const newAdditionalOrganisation = organisationFactory.build();

        when(organisationsService.find)
          .calledWith('example-org-id')
          .mockResolvedValue(newOrganisation);

        when(organisationsService.find)
          .calledWith('other-example-org-id')
          .mockResolvedValue(newAdditionalOrganisation);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDto,
          response,
          'profession-id',
          'version-id',
          request,
        );

        const professionToOrganisations = [
          new ProfessionToOrganisation(
            newOrganisation,
            profession,
            OrganisationRole.PrimaryRegulator,
          ),
          new ProfessionToOrganisation(
            newAdditionalOrganisation,
            profession,
            OrganisationRole.PrimaryRegulator,
          ),
        ];

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            professionToOrganisations: professionToOrganisations,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    it('only updates with one organisation when an additional organisation is not selected', async () => {
      const profession = professionFactory.justCreated('profession-id').build();

      professionsService.findWithVersions.mockResolvedValue(profession);

      const organisationsDto = {
        regulatoryBody: 'example-org-id',
        additionalRegulatoryBody: null,
      };

      const newOrganisation = organisationFactory.build({
        name: 'Council of Gas Safe Engineers',
      });

      when(organisationsService.find)
        .calledWith('example-org-id')
        .mockResolvedValue(newOrganisation);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        organisationsDto,
        response,
        'profession-id',
        'version-id',
        request,
      );

      const professionToOrganisations = [
        new ProfessionToOrganisation(
          newOrganisation,
          profession,
          OrganisationRole.PrimaryRegulator,
        ),
      ];

      expect(professionsService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'profession-id',
          professionToOrganisations: professionToOrganisations,
        }),
      );
    });

    describe('when required parameters are not entered', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const organisationsDtoWithNoAnswers = {
          regulatoryBody: null,
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            errors: {
              regulatoryBody: {
                text: 'professions.form.errors.regulatoryBody.empty',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    it('checks the acting user has permission to update the Profession', async () => {
      const profession = professionFactory.build();

      const organisationsDto = {
        regulatoryBody: 'example-org-id',
        additionalRegulatoryBody: 'other-example-org-id',
      };

      professionsService.findWithVersions.mockResolvedValue(profession);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        organisationsDto,
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

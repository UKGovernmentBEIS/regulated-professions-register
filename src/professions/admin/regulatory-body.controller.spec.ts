import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { when } from 'jest-when';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../organisations/organisations.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';
import { RegulatoryBodyController } from './regulatory-body.controller';

describe(RegulatoryBodyController, () => {
  let controller: RegulatoryBodyController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMockI18nService();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    organisationsService = createMock<OrganisationsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatoryBodyController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: OrganisationsService, useValue: organisationsService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<RegulatoryBodyController>(RegulatoryBodyController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should render a list of Organisations to be displayed in the Selects with none of them selected', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();
        const version = professionVersionFactory
          .justCreated('version-id')
          .build({ profession: profession });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const organisations = organisationFactory.buildList(2);
        organisationsService.all.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(organisations, null);

        await controller.edit(response, 'profession-id', 'version-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulatory-body',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
          }),
        );
        expect(organisationsService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-select both Organisations from the Select', async () => {
        const organisation = organisationFactory.build({
          name: 'Example org',
          id: 'example-org-id',
        });
        const additionalOrganisation = organisationFactory.build({
          name: 'Example org 2',
          id: 'example-org-id-2',
        });
        const profession = professionFactory.build({
          id: 'profession-id',
          organisation: organisation,
          additionalOrganisation: additionalOrganisation,
        });
        const version = professionVersionFactory.build({
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const organisations = [
          organisation,
          additionalOrganisation,
          organisationFactory.build(),
        ];
        organisationsService.all.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(organisations, organisation);

        const regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            additionalOrganisation,
          );

        await controller.edit(response, 'profession-id', 'version-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulatory-body',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation.selectArgs(),
          }),
        );

        expect(organisationsService.all).toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the next page in the journey', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const regulatoryBodyDto = {
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

        await controller.update(
          response,
          'profession-id',
          'version-id',
          regulatoryBodyDto,
        );

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            organisation: newOrganisation,
            additionalOrganisation: newAdditionalOrganisation,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/registration/edit',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the regulatory body form page with errors', async () => {
        const invalidDto = {
          regulatoryBody: null,
        };

        await controller.update(
          response,
          'profession-id',
          'version-id',
          invalidDto,
        );

        expect(professionVersionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulatory-body',
          expect.objectContaining({
            errors: {
              regulatoryBody: {
                text: 'professions.form.errors.regulatoryBody.empty',
              },
            },
          }),
        );
      });
    });

    describe('the "change" query param', () => {
      describe('when set to true', () => {
        it('redirects to check your answers on submit', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
            organisation: organisationFactory.build(),
          });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const regulatoryBodyDtoWithChangeParam = {
            regulatoryBody: 'example-org-id',
            change: true,
          };

          const organisation = organisationFactory.build();
          organisationsService.find.mockResolvedValue(organisation);

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatoryBodyDtoWithChangeParam,
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });

      describe('when false or missing', () => {
        it('continues to the next step in the journey', async () => {
          const organisation = organisationFactory.build();
          const profession = professionFactory.build({
            id: 'profession-id',
            organisation: organisation,
          });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const regulatoryBodyDtoWithFalseChangeParam = {
            regulatoryBody: 'example-org-id',
            change: false,
          };

          organisationsService.find.mockResolvedValue(organisation);

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatoryBodyDtoWithFalseChangeParam,
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/registration/edit',
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

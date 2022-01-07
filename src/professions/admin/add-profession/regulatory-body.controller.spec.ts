import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../../organisations/organisations.service';
import organisationFactory from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import { MandatoryRegistration } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { MandatoryRegistrationRadioButtonsPresenter } from '../mandatory-registration-radio-buttons-presenter';
import { RegulatedAuthoritiesSelectPresenter } from '../regulated-authorities-select-presenter';
import { RegulatoryBodyController } from './regulatory-body.controller';

describe(RegulatoryBodyController, () => {
  let controller: RegulatoryBodyController;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  const organisation1 = organisationFactory.build({
    name: 'Organisation 1',
    id: 'org-1-id',
  });
  const organisation2 = organisationFactory.build({
    name: 'Organisation 2',
    id: 'org-2-id',
  });

  beforeEach(async () => {
    const profession = professionFactory.build({
      id: 'profession-id',
      industries: null,
      occupationLocations: null,
    });

    professionsService = createMock<ProfessionsService>({
      find: async () => profession,
    });

    organisationsService = createMock<OrganisationsService>({
      find: async () => organisation1,
    });

    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'professions.form.radioButtons.mandatoryRegistration.mandatory':
          return 'Mandatory';
        case 'professions.form.radioButtons.mandatoryRegistration.voluntary':
          return 'Voluntary';
        case 'professions.form.radioButtons.mandatoryRegistration.unknown':
          return 'Unknown';
        default:
          return text;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatoryBodyController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: OrganisationsService, useValue: organisationsService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    organisationsService.all.mockImplementation(async () => [
      organisation1,
      organisation2,
    ]);
    response = createMock<Response>();

    controller = module.get<RegulatoryBodyController>(RegulatoryBodyController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should render a list of Organisations to be displayed in a Select, alongside Radio Buttons with mandatory registration values with none of them selected', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.find.mockImplementation(async () => profession);

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(
            [organisation1, organisation2],
            null,
          );

        const mandatoryRegistrationRadioButtonsPresenter =
          new MandatoryRegistrationRadioButtonsPresenter(null, i18nService);

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulatory-body',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenter.radioButtonArgs(),
          }),
        );
        expect(organisationsService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-select the Organisation from the Select and the mandatory registration in the radio buttons', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
          organisation: organisation1,
          mandatoryRegistration: MandatoryRegistration.Mandatory,
        });

        professionsService.find.mockImplementation(async () => profession);

        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            [organisation1, organisation2],
            organisation1,
          );

        const mandatoryRegistrationRadioButtonsPresenterWithSelectedValue =
          new MandatoryRegistrationRadioButtonsPresenter(
            MandatoryRegistration.Mandatory,
            i18nService,
          );

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulatory-body',
          expect.objectContaining({
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.selectArgs(),
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenterWithSelectedValue.radioButtonArgs(),
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
          organisation: organisation1,
          mandatoryRegistration: MandatoryRegistration.Mandatory,
        });

        professionsService.find.mockImplementation(async () => profession);

        const regulatoryBodyDto = {
          regulatoryBody: 'example-org-id',
          mandatoryRegistration: MandatoryRegistration.Voluntary,
        };

        const organisation = organisationFactory.build({
          name: 'Council of Gas Safe Engineers',
        });

        organisationsService.find.mockImplementationOnce(
          async () => organisation,
        );

        await controller.update(response, 'profession-id', regulatoryBodyDto);

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            organisation: organisation,
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            occupationLocations: profession.occupationLocations,
            industries: profession.industries,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/regulated-activities/edit',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the regulatory body form page with errors', async () => {
        const regulatoryBodyDtoWithoutMandatoryRegistration = {
          regulatoryBody: 'example-org-id',
          mandatoryRegistration: undefined,
        };

        await controller.update(
          response,
          'profession-id',
          regulatoryBodyDtoWithoutMandatoryRegistration,
        );

        expect(professionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulatory-body',
          expect.objectContaining({
            errors: {
              mandatoryRegistration: {
                text: 'mandatoryRegistration should not be empty',
              },
            },
          }),
        );
      });
    });

    describe('getSelectedOrganisationFromDtoThenProfession', () => {
      describe('when there is an existing Profession with an Organisation selected and new params are submitted', () => {
        it('returns the dto value, over the Profession', async () => {
          const profession = professionFactory.build({
            organisation: organisation2,
          });

          professionsService.find.mockImplementation(async () => profession);

          const newOrganisation = organisationFactory.build({
            id: 'new-org-id',
          });

          const regulatoryBodyDtoWithNewOrganisation = {
            regulatoryBody: 'new-org-id',
            mandatoryRegistration: undefined,
            change: false,
          };

          organisationsService.find.mockImplementationOnce(
            async () => newOrganisation,
          );

          await expect(
            controller.getSelectedOrganisationFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNewOrganisation,
            ),
          ).resolves.toEqual(newOrganisation);
        });
      });

      describe('when there is an existing Profession with an Organisation selected and empty Organisation params are submitted', () => {
        it('returns the Profession value, not overwriting it', async () => {
          const profession = professionFactory.build({
            organisation: organisation2,
          });

          professionsService.find.mockImplementation(async () => profession);

          const regulatoryBodyDtoWithNoOrganisation = {
            regulatoryBody: undefined,
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            change: false,
          };

          await expect(
            controller.getSelectedOrganisationFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNoOrganisation,
            ),
          ).resolves.toEqual(organisation2);
        });
      });
    });

    describe('getSelectedMandatoryRegistrationFromDtoThenProfession', () => {
      describe('when there is an existing Profession with a Mandatory Registration value selected and new params are submitted', () => {
        it('returns the dto value, over the Profession', () => {
          const profession = professionFactory.build({
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          const regulatoryBodyDtoWithNewMandatoryRegistration = {
            regulatoryBody: 'org-id',
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            change: false,
          };

          expect(
            controller.getSelectedMandatoryRegistrationFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNewMandatoryRegistration,
            ),
          ).toEqual(MandatoryRegistration.Voluntary);
        });
      });

      describe('when there is an existing Profession with a Mandatory Registration selected and empty Mandatory Registration params are submitted', () => {
        it('returns the Profession value, not overwriting it', () => {
          const profession = professionFactory.build({
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          const regulatoryBodyDtoWithNewMandatoryRegistration = {
            regulatoryBody: 'org-id',
            mandatoryRegistration: undefined,
            change: false,
          };

          expect(
            controller.getSelectedMandatoryRegistrationFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNewMandatoryRegistration,
            ),
          ).toEqual(MandatoryRegistration.Mandatory);
        });
      });
    });

    describe('the "change" query param', () => {
      describe('when set to true', () => {
        it('redirects to check your answers on submit', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.find.mockImplementation(async () => profession);

          const regulatoryBodyDtoWithChangeParam = {
            regulatoryBody: 'example-org-id',
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            change: true,
          };

          const organisation = organisationFactory.build();

          organisationsService.find.mockImplementationOnce(
            async () => organisation,
          );

          await controller.update(
            response,
            'profession-id',
            regulatoryBodyDtoWithChangeParam,
          );

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'profession-id',
              organisation: organisation,
              mandatoryRegistration: MandatoryRegistration.Voluntary,
              occupationLocations: profession.occupationLocations,
              industries: profession.industries,
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/check-your-answers',
          );
        });

        it('sets the back link to point to check your answers', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          await controller.edit(response, 'profession-id', true);

          expect(response.render).toHaveBeenCalledWith(
            'professions/admin/add-profession/regulatory-body',
            expect.objectContaining({
              backLink: '/admin/professions/profession-id/check-your-answers',
            }),
          );
        });
      });

      describe('when false or missing', () => {
        it('continues to the next step in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.find.mockImplementation(async () => profession);

          const regulatoryBodyDtoWithFalseChangeParam = {
            regulatoryBody: 'example-org-id',
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            change: false,
          };

          const organisation = organisationFactory.build();

          organisationsService.find.mockImplementationOnce(
            async () => organisation,
          );

          await controller.update(
            response,
            'profession-id',
            regulatoryBodyDtoWithFalseChangeParam,
          );

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'profession-id',
              organisation: organisation,
              mandatoryRegistration: MandatoryRegistration.Voluntary,
              occupationLocations: profession.occupationLocations,
              industries: profession.industries,
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/regulated-activities/edit',
          );
        });

        it('sets the back link to point to the previous step in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          await controller.edit(response, 'profession-id', false);

          expect(response.render).toHaveBeenCalledWith(
            'professions/admin/add-profession/regulatory-body',
            expect.objectContaining({
              backLink:
                '/admin/professions/profession-id/top-level-information/edit',
            }),
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

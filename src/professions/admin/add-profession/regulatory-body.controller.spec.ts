import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsService } from '../../../organisations/organisations.service';
import { MandatoryRegistration, Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { MandatoryRegistrationRadioButtonsPresenter } from '../mandatory-registration-radio-buttons-presenter';
import { RegulatedAuthoritiesSelectPresenter } from '../regulated-authorities-select-presenter';
import { RegulatoryBodyController } from './regulatory-body.controller';

describe(RegulatoryBodyController, () => {
  let controller: RegulatoryBodyController;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let response: DeepMocked<Response>;
  let profession: DeepMocked<Profession>;
  let i18nService: DeepMocked<I18nService>;

  const organisation1 = createMock<Organisation>({
    name: 'Organisation 1',
    id: 'org-1-id',
  });
  const organisation2 = createMock<Organisation>({
    name: 'Organisation 2',
    id: 'org-2-id',
  });

  beforeEach(async () => {
    profession = createMock<Profession>({
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
        professionsService.find.mockImplementation(async () => profession);
        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(
            [organisation1, organisation2],
            null,
          );

        const mandatoryRegistrationRadioButtonsPresenter =
          new MandatoryRegistrationRadioButtonsPresenter(null, i18nService);

        await controller.edit(response, 'profession-id');

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulatory-body',
          {
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenter.radioButtonArgs(),
            errors: undefined,
          },
        );
        expect(organisationsService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession is found', () => {
      const existingProfession = createMock<Profession>({
        id: 'profession-id',
        organisation: organisation1,
        mandatoryRegistration: MandatoryRegistration.Mandatory,
      });

      it('should pre-select the Organisation from the Select and the mandatory registration in the radio buttons', async () => {
        professionsService.find.mockImplementation(
          async () => existingProfession,
        );

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

        await controller.edit(response, 'profession-id');

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulatory-body',
          {
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.selectArgs(),
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenterWithSelectedValue.radioButtonArgs(),
            errors: undefined,
          },
        );

        expect(organisationsService.all).toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the next page in the journey', async () => {
        const regulatoryBodyDto = {
          regulatoryBody: 'example-org-id',
          mandatoryRegistration: MandatoryRegistration.Voluntary,
        };

        const organisation = createMock<Organisation>({
          name: 'Council of Gas Safe Engineers',
        });

        organisationsService.find.mockImplementationOnce(
          async () => organisation,
        );

        await controller.update(response, 'profession-id', regulatoryBodyDto);

        expect(professionsService.save).toHaveBeenCalledWith({
          id: 'profession-id',
          organisation: organisation,
          mandatoryRegistration: MandatoryRegistration.Voluntary,
          occupationLocations: profession.occupationLocations,
          industries: profession.industries,
        });

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/check-your-answers',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the top level information view with errors', async () => {
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
          const profession = createMock<Profession>({
            organisation: organisation2,
          });

          const newOrganisation = createMock<Organisation>({
            name: 'Council of Gas Safe Engineers',
            id: 'new-org-id',
          });

          const regulatoryBodyDtoWithNewOrganisation = {
            regulatoryBody: 'new-org-id',
            mandatoryRegistration: undefined,
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
          const profession = createMock<Profession>({
            organisation: organisation2,
          });

          const regulatoryBodyDtoWithNoOrganisation = {
            regulatoryBody: undefined,
            mandatoryRegistration: MandatoryRegistration.Voluntary,
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
          const profession = createMock<Profession>({
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          const regulatoryBodyDtoWithNewMandatoryRegistration = {
            regulatoryBody: 'org-id',
            mandatoryRegistration: MandatoryRegistration.Voluntary,
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
          const profession = createMock<Profession>({
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          const regulatoryBodyDtoWithNewMandatoryRegistration = {
            regulatoryBody: 'org-id',
            mandatoryRegistration: undefined,
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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

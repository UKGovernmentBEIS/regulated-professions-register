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

  afterEach(() => {
    jest.resetAllMocks();
  });
});

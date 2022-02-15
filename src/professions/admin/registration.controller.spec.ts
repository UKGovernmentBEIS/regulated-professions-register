import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { RegistrationController } from './registration.controller';

import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';

import { MandatoryRegistration } from '../profession-version.entity';

import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';

import { MandatoryRegistrationRadioButtonsPresenter } from './mandatory-registration-radio-buttons-presenter';

describe(RegistrationController, () => {
  let controller: RegistrationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMockI18nService();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should return Radio Buttons with mandatory registration values with none of them selected', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();
        const version = professionVersionFactory
          .justCreated('version-id')
          .build({ profession: profession });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const mandatoryRegistrationRadioButtonsPresenter =
          new MandatoryRegistrationRadioButtonsPresenter(null, i18nService);

        await controller.edit(response, 'profession-id', 'version-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/registration',
          expect.objectContaining({
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenter.radioButtonArgs(),
          }),
        );
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-select the mandatory registration in the radio buttons and pre-populate the other values', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });
        const version = professionVersionFactory.build({
          profession: profession,
          mandatoryRegistration: MandatoryRegistration.Mandatory,
          registrationRequirements: 'Something',
          registrationUrl: 'http://example.com',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const mandatoryRegistrationRadioButtonsPresenterWithSelectedValue =
          new MandatoryRegistrationRadioButtonsPresenter(
            MandatoryRegistration.Mandatory,
            i18nService,
          );

        await controller.edit(response, 'profession-id', 'version-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/registration',
          expect.objectContaining({
            registrationRequirements: 'Something',
            registrationUrl: 'http://example.com',
            mandatoryRegistrationRadioButtonArgs:
              await mandatoryRegistrationRadioButtonsPresenterWithSelectedValue.radioButtonArgs(),
          }),
        );
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
          mandatoryRegistration: MandatoryRegistration.Mandatory,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const registrationDto = {
          mandatoryRegistration: MandatoryRegistration.Voluntary,
          registrationRequirements: 'Something',
          registrationUrl: 'http://example.com',
        };

        await controller.update(
          response,
          'profession-id',
          'version-id',
          registrationDto,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            registrationRequirements: 'Something',
            registrationUrl: 'http://example.com',
            profession: profession,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/regulated-activities/edit',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the regulatory body form page with errors', async () => {
        const registrationDtoWithoutMandatoryRegistration = {
          mandatoryRegistration: undefined,
          registrationUrl: 'not a url',
        };

        await controller.update(
          response,
          'profession-id',
          'version-id',
          registrationDtoWithoutMandatoryRegistration,
        );

        expect(professionVersionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/registration',
          expect.objectContaining({
            errors: {
              mandatoryRegistration: {
                text: 'professions.form.errors.mandatoryRegistration.empty',
              },
              registrationUrl: {
                text: 'professions.form.errors.registrationUrl.invalid',
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
          });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const registrationDtoWithChangeParam = {
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            registrationUrl: '',
            change: true,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            registrationDtoWithChangeParam,
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });

      describe('when false or missing', () => {
        it('continues to the next step in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            mandatoryRegistration: MandatoryRegistration.Mandatory,
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const registrationDtoWithFalseChangeParam = {
            mandatoryRegistration: MandatoryRegistration.Voluntary,
            registrationUrl: '',
            change: false,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            registrationDtoWithFalseChangeParam,
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/regulated-activities/edit',
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

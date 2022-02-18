import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { MethodToObtain } from '../../qualifications/qualification.entity';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { MethodToObtainQualificationRadioButtonsPresenter } from './method-to-obtain-qualification-radio-buttons.presenter';
import { YesNoRadioButtonArgsPresenter } from './yes-no-radio-buttons-presenter';
import { QualificationsDto } from './dto/qualifications.dto';
import { QualificationsController } from './qualifications.controller';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isUK } from '../../helpers/nations.helper';

import professionVersionFactory from '../../testutils/factories/profession-version';
import qualificationFactory from '../../testutils/factories/qualification';

jest.mock('../../helpers/nations.helper');

describe(QualificationsController, () => {
  let controller: QualificationsController;
  let response: DeepMocked<Response>;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: I18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualificationsController],
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

    controller = module.get<QualificationsController>(QualificationsController);
  });

  describe('edit', () => {
    it('should render form page', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
      });

      const version = professionVersionFactory.build({
        id: 'version-id',
        profession: profession,
        qualification: qualificationFactory.build(),
      });

      const methodToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          version.qualification.methodToObtainDeprecated,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('methodToObtainQualification');

      const mostCommonPathToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          version.qualification.commonPathToObtainDeprecated,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('mostCommonPathToObtainQualification');

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);
      (isUK as jest.Mock).mockImplementation(() => false);

      await controller.edit(response, 'profession-id', 'version-id', false);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/qualifications',
        expect.objectContaining({
          methodToObtainQualificationRadioButtonArgs,
          mostCommonPathToObtainQualificationRadioButtonArgs,
          mandatoryProfessionalExperienceRadioButtonArgs:
            await new YesNoRadioButtonArgsPresenter(
              version.qualification.mandatoryProfessionalExperience,
              i18nService,
            ).radioButtonArgs(),
          isUK: false,
        }),
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      describe('when the "Change" query param is false', () => {
        it('creates a new Qualification on the Profession and redirects to the next page in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            qualification: qualificationFactory.build(),
          });

          const dto: QualificationsDto = {
            level: 'Qualification level',
            methodToObtainQualification: MethodToObtain.DegreeLevel,
            otherMethodToObtainQualification: '',
            mostCommonPathToObtainQualification: MethodToObtain.DegreeLevel,
            otherMostCommonPathToObtainQualification: '',
            duration: '3.0 Years',
            mandatoryProfessionalExperience: '1',
            ukRecognition: 'ukRecognition',
            ukRecognitionUrl: 'http://example.com/uk',
            otherCountriesRecognition: 'otherCountriesRecognition',
            otherCountriesRecognitionUrl: 'http://example.com/other',
            change: false,
          };

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          await controller.update(response, 'profession-id', 'version-id', dto);

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              qualification: expect.objectContaining({
                commonPathToObtainDeprecated: 'degreeLevel',
                otherMethodToObtain: '',
                otherCommonPathToObtain: '',
                educationDuration: '3.0 Years',
                level: 'Qualification level',
                mandatoryProfessionalExperience: true,
                methodToObtainDeprecated: 'degreeLevel',
                ukRecognition: 'ukRecognition',
                ukRecognitionUrl: 'http://example.com/uk',
                otherCountriesRecognition: 'otherCountriesRecognition',
                otherCountriesRecognitionUrl: 'http://example.com/other',
              }),
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/legislation/edit',
          );
        });
      });

      describe('when the "Change" query param is true', () => {
        it('creates a new Qualification on the Profession and redirects to "Check your answers"', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            qualification: qualificationFactory.build(),
          });

          const dto: QualificationsDto = {
            level: 'Qualification level',
            methodToObtainQualification: MethodToObtain.DegreeLevel,
            otherMethodToObtainQualification: '',
            mostCommonPathToObtainQualification: MethodToObtain.DegreeLevel,
            otherMostCommonPathToObtainQualification: '',
            duration: '3.0 Years',
            mandatoryProfessionalExperience: '1',
            ukRecognition: 'ukRecognition',
            ukRecognitionUrl: 'http://example.com/uk',
            otherCountriesRecognition: 'otherCountriesRecognition',
            otherCountriesRecognitionUrl: 'http://example.com/other',
            change: true,
          };

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          await controller.update(response, 'profession-id', 'version-id', dto);

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              qualification: expect.objectContaining({
                commonPathToObtainDeprecated: 'degreeLevel',
                otherMethodToObtain: '',
                otherCommonPathToObtain: '',
                educationDuration: '3.0 Years',
                level: 'Qualification level',
                mandatoryProfessionalExperience: true,
                methodToObtainDeprecated: 'degreeLevel',
                ukRecognition: 'ukRecognition',
                ukRecognitionUrl: 'http://example.com/uk',
                otherCountriesRecognition: 'otherCountriesRecognition',
                otherCountriesRecognitionUrl: 'http://example.com/other',
              }),
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the Profession and reloads the form with errors and successfully submitted values', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        const dto: QualificationsDto = {
          level: undefined,
          methodToObtainQualification: undefined,
          otherMethodToObtainQualification: '',
          mostCommonPathToObtainQualification: undefined,
          otherMostCommonPathToObtainQualification: '',
          duration: '',
          mandatoryProfessionalExperience: undefined,
          change: false,
          ukRecognition: '',
          ukRecognitionUrl: 'not a url',
          otherCountriesRecognition: '',
          otherCountriesRecognitionUrl: 'not a url',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        (isUK as jest.Mock).mockImplementation(() => false);

        await controller.update(response, 'profession-id', 'version-id', dto);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualifications',
          expect.objectContaining({
            mandatoryProfessionalExperienceRadioButtonArgs:
              await new YesNoRadioButtonArgsPresenter(
                undefined,
                i18nService,
              ).radioButtonArgs(),
            isUK: false,
            errors: {
              level: {
                text: 'professions.form.errors.qualification.level.empty',
              },
              mandatoryProfessionalExperience: {
                text: 'professions.form.errors.qualification.mandatoryProfessionalExperience.empty',
              },
              methodToObtainQualification: {
                text: 'professions.form.errors.qualification.methodToObtain.empty',
              },
              duration: {
                text: 'professions.form.errors.qualification.duration.empty',
              },
              mostCommonPathToObtainQualification: {
                text: 'professions.form.errors.qualification.mostCommonPathToObtain.empty',
              },
              ukRecognitionUrl: {
                text: 'professions.form.errors.qualification.ukRecognitionUrl.invalid',
              },
              otherCountriesRecognitionUrl: {
                text: 'professions.form.errors.qualification.otherCountriesRecognitionUrl.invalid',
              },
            },
          }),
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

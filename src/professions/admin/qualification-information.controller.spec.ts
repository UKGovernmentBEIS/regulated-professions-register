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
import { QualificationInformationDto } from './dto/qualification-information.dto';
import { QualificationInformationController } from './qualification-information.controller';

describe(QualificationInformationController, () => {
  let controller: QualificationInformationController;
  let response: DeepMocked<Response>;
  let professionsService: DeepMocked<ProfessionsService>;
  let i18nService: I18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualificationInformationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<QualificationInformationController>(
      QualificationInformationController,
    );
  });

  describe('edit', () => {
    it('should render form page', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
      });

      const methodToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          profession.qualification.methodToObtain,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('methodToObtainQualification');

      const mostCommonPathToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          profession.qualification.commonPathToObtain,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('mostCommonPathToObtainQualification');

      professionsService.findWithVersions.mockResolvedValue(profession);

      await controller.edit(response, 'profession-id', 'version-id', false);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/qualification-information',
        expect.objectContaining({
          methodToObtainQualificationRadioButtonArgs,
          mostCommonPathToObtainQualificationRadioButtonArgs,
          mandatoryProfessionalExperienceRadioButtonArgs:
            await new YesNoRadioButtonArgsPresenter(
              profession.qualification.mandatoryProfessionalExperience,
              i18nService,
            ).radioButtonArgs(),
        }),
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      describe('when the "Change" query param is false', () => {
        it('creates a new Qualification on the Profession and redirects to the next page in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          const dto: QualificationInformationDto = {
            level: 'Qualification level',
            methodToObtainQualification: MethodToObtain.DegreeLevel,
            otherMethodToObtainQualification: '',
            mostCommonPathToObtainQualification: MethodToObtain.DegreeLevel,
            otherMostCommonPathToObtainQualification: '',
            duration: '3.0 Years',
            mandatoryProfessionalExperience: '1',
            change: false,
          };

          professionsService.findWithVersions.mockResolvedValue(profession);

          await controller.update(response, 'profession-id', 'version-id', dto);

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              qualification: expect.objectContaining({
                commonPathToObtain: 'degreeLevel',
                otherMethodToObtain: '',
                otherCommonPathToObtain: '',
                educationDuration: '3.0 Years',
                level: 'Qualification level',
                mandatoryProfessionalExperience: true,
                methodToObtain: 'degreeLevel',
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

          const dto: QualificationInformationDto = {
            level: 'Qualification level',
            methodToObtainQualification: MethodToObtain.DegreeLevel,
            otherMethodToObtainQualification: '',
            mostCommonPathToObtainQualification: MethodToObtain.DegreeLevel,
            otherMostCommonPathToObtainQualification: '',
            duration: '3.0 Years',
            mandatoryProfessionalExperience: '1',
            change: true,
          };

          professionsService.findWithVersions.mockResolvedValue(profession);

          await controller.update(response, 'profession-id', 'version-id', dto);

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              qualification: expect.objectContaining({
                commonPathToObtain: 'degreeLevel',
                otherMethodToObtain: '',
                otherCommonPathToObtain: '',
                educationDuration: '3.0 Years',
                level: 'Qualification level',
                mandatoryProfessionalExperience: true,
                methodToObtain: 'degreeLevel',
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

        const dto: QualificationInformationDto = {
          level: undefined,
          methodToObtainQualification: undefined,
          otherMethodToObtainQualification: '',
          mostCommonPathToObtainQualification: undefined,
          otherMostCommonPathToObtainQualification: '',
          duration: '',
          mandatoryProfessionalExperience: undefined,
          change: false,
        };

        professionsService.findWithVersions.mockResolvedValue(profession);

        await controller.update(response, 'profession-id', 'version-id', dto);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualification-information',
          expect.objectContaining({
            mandatoryProfessionalExperienceRadioButtonArgs:
              await new YesNoRadioButtonArgsPresenter(
                undefined,
                i18nService,
              ).radioButtonArgs(),
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

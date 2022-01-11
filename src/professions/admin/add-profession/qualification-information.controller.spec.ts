import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { MethodToObtainQualificationRadioButtonsPresenter } from '../method-to-obtain-qualification-radio-buttons.presenter';
import { YesNoRadioButtonArgsPresenter } from '../yes-no-radio-buttons-presenter';
import { QualificationInformationController } from './qualification-information.controller';

describe(QualificationInformationController, () => {
  let controller: QualificationInformationController;
  let response: DeepMocked<Response>;
  let i18nService: I18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualificationInformationController],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compile();

    response = createMock<Response>();

    controller = module.get<QualificationInformationController>(
      QualificationInformationController,
    );
  });

  describe('edit', () => {
    it('should render form page', async () => {
      const methodToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          null,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('methodToObtainQualification');

      const mostCommonPathToObtainQualificationRadioButtonArgs =
        await new MethodToObtainQualificationRadioButtonsPresenter(
          null,
          undefined,
          undefined,
          i18nService,
        ).radioButtonArgs('mostCommonPathToObtainQualification');

      await controller.edit(response);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/add-profession/qualification-information',
        expect.objectContaining({
          methodToObtainQualificationRadioButtonArgs,
          mostCommonPathToObtainQualificationRadioButtonArgs,
          mandatoryProfessionalExperienceRadioButtonArgs:
            await new YesNoRadioButtonArgsPresenter(
              null,
              i18nService,
            ).radioButtonArgs(),
        }),
      );
    });
  });

  describe('update', () => {
    it('redirects to "Check your answers"', async () => {
      await controller.update(response, 'profession-id');

      expect(response.redirect).toHaveBeenCalledWith(
        '/admin/professions/profession-id/check-your-answers',
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

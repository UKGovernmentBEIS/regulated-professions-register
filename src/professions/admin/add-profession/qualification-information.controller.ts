import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { MethodToObtainQualificationRadioButtonsPresenter } from '../method-to-obtain-qualification-radio-buttons.presenter';
import { YesNoRadioButtonArgsPresenter } from '../yes-no-radio-buttons-presenter';

@Controller('admin/professions')
export class QualificationInformationController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('/:id/qualification-information/edit')
  async edit(@Res() res: Response): Promise<void> {
    return res.render(
      'admin/professions/add-profession/qualification-information',
      {
        methodToObtainQualificationRadioButtonArgs:
          await new MethodToObtainQualificationRadioButtonsPresenter(
            null,
            undefined,
            undefined,
            this.i18nService,
          ).radioButtonArgs('methodToObtainQualification'),
        mostCommonPathToObtainQualificationRadioButtonArgs:
          await new MethodToObtainQualificationRadioButtonsPresenter(
            null,
            undefined,
            undefined,
            this.i18nService,
          ).radioButtonArgs('mostCommonPathToObtainQualification'),
        mandatoryProfessionalExperienceRadioButtonArgs:
          await new YesNoRadioButtonArgsPresenter(
            null,
            this.i18nService,
          ).radioButtonArgs(),
      },
    );
  }

  @Post('/:id/qualification-information')
  async update(@Res() res: Response, @Param('id') id: string): Promise<void> {
    return res.redirect(`/admin/professions/${id}/check-your-answers`);
  }
}

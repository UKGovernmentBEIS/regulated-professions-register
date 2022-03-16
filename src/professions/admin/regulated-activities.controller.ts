import {
  Controller,
  Get,
  Res,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import {
  ProfessionVersion,
  RegulationType,
} from '../profession-version.entity';
import { Profession } from '../profession.entity';
import { I18nService } from 'nestjs-i18n';
import { RegulationTypeRadioButtonsPresenter } from './presenters/regulation-type-radio-buttons.presenter';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/regulated-activities/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanViewProfession(req, profession);

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      version.description,
      version.regulationType,
      version.reservedActivities,
      version.protectedTitles,
      version.regulationUrl,
      profession,
    );
  }

  @Post('/:professionId/versions/:versionId/regulated-activities')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() regulatedActivitiesDto,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanViewProfession(req, profession);

    const validator = await Validator.validate(
      RegulatedActivitiesDto,
      regulatedActivitiesDto,
    );
    const submittedValues = validator.obj;

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        submittedValues.regulationSummary,
        submittedValues.regulationType,
        submittedValues.reservedActivities,
        submittedValues.protectedTitles,
        submittedValues.regulationUrl,
        profession,
        errors,
      );
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        regulationType: submittedValues.regulationType,
        description: submittedValues.regulationSummary,
        reservedActivities: submittedValues.reservedActivities,
        protectedTitles: submittedValues.protectedTitles,
        regulationUrl: submittedValues.regulationUrl,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    regulationSummary: string | null,
    regulationType: RegulationType | null,
    reservedActivities: string | null,
    protectedTitles: string | null,
    regulationUrl: string | null,
    profession: Profession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const regulationTypePresenter = new RegulationTypeRadioButtonsPresenter(
      regulationType,
      this.i18nService,
    );

    const regulationTypeRadioButtonArgs =
      await regulationTypePresenter.radioButtonArgs();

    const templateArgs: RegulatedActivitiesTemplate = {
      regulationSummary,
      regulationTypeRadioButtonArgs,
      reservedActivities,
      protectedTitles,
      regulationUrl,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      errors,
    };

    return res.render('admin/professions/regulated-activities', templateArgs);
  }
}

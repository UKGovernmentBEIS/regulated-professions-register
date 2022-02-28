import {
  Controller,
  Get,
  Res,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
import { ProfessionVersion } from '../profession-version.entity';
import { Profession } from '../profession.entity';
import { I18nService } from 'nestjs-i18n';
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
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/registration/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: string,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      version.description,
      version.reservedActivities,
      version.protectedTitles,
      version.regulationUrl,
      profession,
      change === 'true',
    );
  }

  @Post('/:professionId/versions/:versionId/regulated-activities')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/registration/edit',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() regulatedActivitiesDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      RegulatedActivitiesDto,
      regulatedActivitiesDto,
    );
    const submittedValues = validator.obj;

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        submittedValues.regulationSummary,
        submittedValues.reservedActivities,
        submittedValues.protectedTitles,
        submittedValues.regulationUrl,
        profession,
        submittedValues.change,
        errors,
      );
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        description: submittedValues.regulationSummary,
        reservedActivities: submittedValues.reservedActivities,
        protectedTitles: submittedValues.protectedTitles,
        regulationUrl: submittedValues.regulationUrl,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    if (submittedValues.change) {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/qualifications/edit`,
    );
  }

  private async renderForm(
    res: Response,
    regulationSummary: string | null,
    reservedActivities: string | null,
    protectedTitles: string | null,
    regulationUrl: string | null,
    profession: Profession,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: RegulatedActivitiesTemplate = {
      regulationSummary,
      reservedActivities,
      protectedTitles,
      regulationUrl,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      change,
      errors,
    };

    return res.render('admin/professions/regulated-activities', templateArgs);
  }
}

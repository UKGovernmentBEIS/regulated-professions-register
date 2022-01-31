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
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
  ) {}

  @Get('/:professionId/versions/:versionId/regulated-activities/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/regulatory-body/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    this.renderForm(
      res,
      version.reservedActivities,
      version.description,
      profession.slug !== null,
      change,
    );
  }

  @Post('/:professionId/versions/:versionId/regulated-activities')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/regulatory-body/edit',
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

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const submittedValues: RegulatedActivitiesDto = regulatedActivitiesDto;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        submittedValues.activities,
        submittedValues.description,
        profession.slug !== null,
        submittedValues.change,
        errors,
      );
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        reservedActivities: submittedValues.activities,
        description: submittedValues.description,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    if (submittedValues.change) {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/qualification-information/edit`,
    );
  }

  private async renderForm(
    res: Response,
    reservedActivities: string | null,
    regulationDescription: string | null,
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: RegulatedActivitiesTemplate = {
      reservedActivities,
      regulationDescription,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/regulated-activities', templateArgs);
  }
}

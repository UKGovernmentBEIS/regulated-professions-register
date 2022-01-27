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
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(private readonly professionsService: ProfessionsService) {}

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
    const profession = await this.professionsService.find(professionId);

    this.renderForm(
      res,
      profession.reservedActivities,
      profession.description,
      profession.confirmed,
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

    const profession = await this.professionsService.find(professionId);

    const submittedValues: RegulatedActivitiesDto = regulatedActivitiesDto;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        submittedValues.activities,
        submittedValues.description,
        profession.confirmed,
        submittedValues.change,
        errors,
      );
    }

    const updated: Profession = {
      ...profession,
      ...{
        reservedActivities: submittedValues.activities,
        description: submittedValues.description,
      },
    };

    await this.professionsService.save(updated);

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

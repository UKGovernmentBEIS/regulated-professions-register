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
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user.entity';
import ViewUtils from './viewUtils';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get('/:id/regulated-activities/edit')
  @Permissions(UserPermission.CreateProfession)
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    this.renderForm(
      res,
      profession.reservedActivities,
      profession.description,
      profession.confirmed,
      change,
      this.backLink(change, id),
    );
  }

  @Post('/:id/regulated-activities')
  @Permissions(UserPermission.CreateProfession)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() regulatedActivitiesDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      RegulatedActivitiesDto,
      regulatedActivitiesDto,
    );

    const profession = await this.professionsService.find(id);

    const submittedValues: RegulatedActivitiesDto = regulatedActivitiesDto;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        submittedValues.activities,
        submittedValues.description,
        submittedValues.change,
        profession.confirmed,
        this.backLink(submittedValues.change, id),
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
      return res.redirect(`/admin/professions/${id}/check-your-answers`);
    }

    return res.redirect(
      `/admin/professions/${id}/qualification-information/edit`,
    );
  }

  private async renderForm(
    res: Response,
    reservedActivities: string | null,
    regulationDescription: string | null,
    isEditing: boolean,
    change: boolean,
    backLink: string,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: RegulatedActivitiesTemplate = {
      reservedActivities,
      regulationDescription,
      captionText: ViewUtils.captionText(isEditing),
      change,
      backLink,
      errors,
    };

    return res.render('admin/professions/regulated-activities', templateArgs);
  }

  private backLink(change: boolean, id: string) {
    return change
      ? `/admin/professions/${id}/check-your-answers`
      : `/admin/professions/${id}/regulatory-body/edit`;
  }
}

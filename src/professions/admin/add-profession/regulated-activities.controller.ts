import { Controller, Get, Res, Param, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { Validator } from '../../../helpers/validator';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';

@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get('/:id/regulated-activities/edit')
  async edit(@Res() res: Response, @Param('id') id: string): Promise<void> {
    const profession = await this.professionsService.find(id);

    this.renderForm(res, profession.reservedActivities, profession.description);
  }

  @Post('/:id/regulated-activities')
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

    const regulatedActivitiesAnswers: RegulatedActivitiesDto =
      regulatedActivitiesDto;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        this.getPreviouslyEnteredReservedActivitiesFromDtoThenProfession(
          profession,
          regulatedActivitiesAnswers,
        ),
        this.getPreviouslyEnteredDescriptionFromDtoThenProfession(
          profession,
          regulatedActivitiesAnswers,
        ),
        errors,
      );
    }

    const updated: Profession = {
      ...profession,
      ...{
        reservedActivities: regulatedActivitiesAnswers.activities,
        description: regulatedActivitiesAnswers.description,
      },
    };

    await this.professionsService.save(updated);

    return res.redirect(`/admin/professions/${id}/check-your-answers`);
  }

  private async renderForm(
    res: Response,
    reservedActivities: string | null,
    regulationDescription: string | null,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: RegulatedActivitiesTemplate = {
      reservedActivities,
      regulationDescription,
      errors: errors,
    };

    return res.render(
      'professions/admin/add-profession/regulated-activities',
      templateArgs,
    );
  }

  getPreviouslyEnteredReservedActivitiesFromDtoThenProfession(
    profession: Profession,
    regulatedActivitiesDto: RegulatedActivitiesDto,
  ) {
    return regulatedActivitiesDto.activities || profession.reservedActivities;
  }

  getPreviouslyEnteredDescriptionFromDtoThenProfession(
    profession: Profession,
    regulatedActivitiesDto: RegulatedActivitiesDto,
  ) {
    return regulatedActivitiesDto.description || profession.description;
  }
}

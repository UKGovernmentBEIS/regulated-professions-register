import { Controller, Get, Res, Param, Post } from '@nestjs/common';
import { Response } from 'express';
import { ProfessionsService } from '../../professions.service';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';

@Controller('admin/professions')
export class RegulatedActivitiesController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get('/:id/regulated-activities/edit')
  async edit(@Res() res: Response, @Param('id') id: string): Promise<void> {
    const profession = await this.professionsService.find(id);

    const templateArgs: RegulatedActivitiesTemplate = {
      reservedActivities: profession.reservedActivities,
      regulationDescription: profession.description,
    };

    return res.render(
      'professions/admin/add-profession/regulated-activities',
      templateArgs,
    );
  }

  @Post('/:id/regulated-activities')
  async update(@Res() res: Response, @Param('id') id: string): Promise<void> {
    return res.redirect(`/admin/professions/${id}/check-your-answers`);
  }
}

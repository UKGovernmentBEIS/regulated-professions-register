import { Controller, Get, Param, Post, Render, Res } from '@nestjs/common';
import { Response } from 'express';

import { ProfessionsService } from '../../professions.service';
import { ConfirmationTemplate } from './interfaces/confirmation.template';

@Controller('admin/professions')
export class ConfirmationController {
  constructor(private professionsService: ProfessionsService) {}

  @Post('/:id/confirmation')
  async create(@Res() res: Response, @Param('id') id: string): Promise<void> {
    const profession = await this.professionsService.find(id);

    await this.professionsService.confirm(profession);

    res.redirect(`/admin/professions/${id}/confirmation`);
  }

  @Get('/:id/confirmation')
  @Render('professions/admin/add-profession/confirmation')
  async new(@Param('id') id: string): Promise<ConfirmationTemplate> {
    const profession = await this.professionsService.find(id);

    return { name: profession.name };
  }
}

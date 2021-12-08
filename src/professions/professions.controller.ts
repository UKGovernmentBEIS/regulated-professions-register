import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { generateSlug } from '../helpers/slug.helper';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from './professions.service';
import { Response } from 'express';

@Controller()
export class ProfessionsController {
  constructor(private professionsService: ProfessionsService) {}

  @Get('professions/:slug/:id')
  async show(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${id} could not be found`,
      );
    }

    const generatedSlug = generateSlug(profession.name);

    if (generatedSlug !== slug) {
      res.redirect(301, `/professions/${generatedSlug}/${id}`);
    } else {
      const templateParams: ShowTemplate = { profession, backUrl: '' };
      res.render('professions/show', templateParams);
    }
  }
}

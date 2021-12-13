import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from './professions.service';

@Controller()
export class ProfessionsController {
  constructor(private professionsService: ProfessionsService) {}

  @Get('professions/:slug')
  @Render('professions/show')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession = await this.professionsService.findBySlug(slug);

    if (!profession) {
      throw new NotFoundException(
        `A profession with slug ${slug} could not be found`,
      );
    }

    const templateParams: ShowTemplate = { profession, backUrl: '' };
    return templateParams;
  }
}

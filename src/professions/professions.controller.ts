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

  @Get('admin/professions/add-profession')
  @Render('professions/admin/add-profession/new')
  new(): Record<string, any> {
    return {};
  }

  @Get('professions/:slug')
  @Render('professions/show')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession = await this.professionsService.findBySlug(slug);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    return { profession, backUrl: '' };
  }
}

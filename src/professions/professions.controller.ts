import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nations/nation';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from './professions.service';

@Controller()
export class ProfessionsController {
  constructor(
    private professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/professions/:slug')
  @Render('professions/show')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession = await this.professionsService.findBySlug(slug);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    const nations = await Promise.all(
      profession.occupationLocations.map(async (code) =>
        Nation.find(code).translatedName(this.i18nService),
      ),
    );

    const industries = await Promise.all(
      profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    return { profession, nations, industries, backUrl: '' };
  }
}

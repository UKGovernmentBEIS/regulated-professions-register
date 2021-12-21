import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nations/nation';
import { ShowTemplate } from './interfaces/show-template.interface';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

@Controller()
export class ProfessionsController {
  constructor(
    private professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('admin/professions/add-profession')
  @Render('professions/admin/add-profession/new')
  new(): Record<string, any> {
    return {};
  }

  @Post('admin/professions')
  async create(@Res() res: Response): Promise<void> {
    const profession = await this.professionsService.save(new Profession());

    res.redirect(
      `/admin/professions/${profession.id}/top-level-information/edit`,
    );
  }

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

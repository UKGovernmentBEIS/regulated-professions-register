import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Render,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nations/nation';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from './professions.service';
import { BackLink } from '../common/decorators/back-link.decorator';
import { Organisation } from '../organisations/organisation.entity';
@Controller()
export class ProfessionsController {
  constructor(
    private professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/professions/:slug')
  @Render('professions/show')
  @BackLink('/professions/search')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const profession = await this.professionsService.findBySlug(slug);

    if (!profession) {
      throw new NotFoundException(
        `A profession with ID ${slug} could not be found`,
      );
    }

    const organisation = Organisation.withLatestLiveVersion(
      profession.organisation,
    );

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

    const qualification = profession.qualification
      ? new QualificationPresenter(profession.qualification)
      : null;

    return {
      profession,
      qualification: qualification,
      nations,
      industries,
      organisation,
    };
  }
}

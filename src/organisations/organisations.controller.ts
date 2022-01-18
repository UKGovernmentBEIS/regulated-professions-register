import { Controller, Get, Render, Param } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { OrganisationsService } from './organisations.service';
import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';

@Controller()
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/regulatory-authorities/:slug')
  @Render('organisations/show')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const organisation =
      await this.organisationsService.findBySlugWithProfessions(slug);

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      '/regulatory-authorities/search',
      this.i18nService,
    );

    return organisationSummaryPresenter.present();
  }
}

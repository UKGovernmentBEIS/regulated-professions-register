import { Controller, Get, Render, Param } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { OrganisationVersionsService } from './organisation-versions.service';
import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';
import { BackLink } from '../common/decorators/back-link.decorator';
@Controller()
export class OrganisationsController {
  constructor(
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/regulatory-authorities/:slug')
  @Render('organisations/show')
  @BackLink('/regulatory-authorities/search', 'app.backToSearch')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const organisation = await this.organisationVersionsService.findLiveBySlug(
      slug,
    );

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      this.i18nService,
    );

    return organisationSummaryPresenter.present(false);
  }
}

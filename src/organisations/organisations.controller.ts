import { Controller, Get, Render, Param } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

import { OrganisationVersionsService } from './organisation-versions.service';
import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationSummaryPresenter } from './presenters/organisation-summary.presenter';
import { BackLink } from '../common/decorators/back-link.decorator';
import { getProfessionsFromOrganisation } from './helpers/get-professions-from-organisation.helper';
import { Profession } from '../professions/profession.entity';

@Controller()
export class OrganisationsController {
  constructor(
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/regulatory-authorities/:slug')
  @Render('organisations/show')
  @BackLink(
    (request: Request) => request.session.searchResultUrl,
    'app.backToSearch',
  )
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const organisation =
      await this.organisationVersionsService.findLiveBySlug(slug);

    const professions = getProfessionsFromOrganisation(organisation)
      .map((profession) => Profession.withLatestLiveVersion(profession))
      .filter((n) => n);

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      professions,
      this.i18nService,
    );

    return organisationSummaryPresenter.present(false);
  }
}

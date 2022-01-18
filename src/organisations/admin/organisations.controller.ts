import { Controller, UseGuards, Get, Render, Param } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { OrganisationsService } from '../organisations.service';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';

import { EditTemplate } from './interfaces/edit-template.interface';
import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';

@UseGuards(AuthenticationGuard)
@Controller('/admin/organisations')
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('admin/organisations/index')
  async index() {
    const organisations = await this.organisationsService.allWithProfessions();
    const presenter = new OrganisationsPresenter(
      organisations,
      this.i18nService,
    );

    return {
      organisationsTable: await presenter.table(),
    };
  }

  @Get('/:slug')
  @Render('admin/organisations/show')
  async show(@Param('slug') slug: string): Promise<EditTemplate> {
    const organisation =
      await this.organisationsService.findBySlugWithProfessions(slug);

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      '/admin/organisations',
      this.i18nService,
    );

    return organisationSummaryPresenter.present();
  }
}

import { Controller, UseGuards, Get, Render, Param } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { OrganisationsService } from '../organisations.service';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';

import { EditTemplate } from './interfaces/edit-template.interface';
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
    const organisations = await this.organisationsService.all({
      relations: ['professions', 'professions.industries'],
    });
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
    const organisation = await this.organisationsService.findBySlug(slug, {
      relations: ['professions'],
    });
    const organisationPresenter = new OrganisationPresenter(
      organisation,
      this.i18nService,
    );
    const professionPresenters = organisation.professions.map(
      (profession) => new ProfessionPresenter(profession, this.i18nService),
    );

    return {
      organisation,
      summaryList: await organisationPresenter.summaryList(),
      professions: await Promise.all(
        professionPresenters.map(async (presenter) => {
          return {
            name: presenter.profession.name,
            slug: presenter.profession.slug,
            summaryList: await presenter.summaryList(),
          };
        }),
      ),
      backLink: '/admin/organisations',
    };
  }
}

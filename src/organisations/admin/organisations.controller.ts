import { Controller, UseGuards, Get, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { OrganisationsService } from '../organisations.service';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';

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
}

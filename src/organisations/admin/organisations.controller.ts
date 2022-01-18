import {
  Controller,
  UseGuards,
  Get,
  Render,
  Param,
  Post,
  Body,
  UseFilters,
  Put,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';

import { ConfirmTemplate } from './interfaces/confirm-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationDto } from './dto/organisation.dto';
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
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const organisation =
      await this.organisationsService.findBySlugWithProfessions(slug);

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      '/admin/organisations',
      this.i18nService,
    );

    return organisationSummaryPresenter.present();
  }

  @Get('/:slug/edit')
  @Render('admin/organisations/edit')
  async edit(@Param('slug') slug: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findBySlug(slug);

    return organisation;
  }

  @Post('/:slug/confirm')
  @Render('admin/organisations/confirm')
  @UseFilters(new ValidationExceptionFilter('admin/organisations/edit'))
  async confirm(
    @Param('slug') slug: string,
    @Body() organisationDto: OrganisationDto,
  ): Promise<ConfirmTemplate> {
    const organisation = await this.organisationsService.findBySlug(slug);
    const newOrganisation = {
      ...organisation,
      ...(organisationDto as Organisation),
    };

    const updatedOrganisation = await this.organisationsService.save(
      newOrganisation,
    );

    const organisationPresenter = new OrganisationPresenter(
      updatedOrganisation,
      this.i18nService,
    );

    return {
      ...updatedOrganisation,
      summaryList: await organisationPresenter.summaryList({
        classes: 'govuk-summary-list',
        removeBlank: false,
        includeName: true,
        includeActions: true,
      }),
    };
  }

  @Put('/:slug')
  @Render('admin/organisations/complete')
  async create(@Param('slug') slug: string): Promise<Organisation> {
    const organisation = await this.organisationsService.findBySlug(slug);

    // This should potentially add a confirmed flag to the object once
    // we have draft functionality in place
    await this.organisationsService.save(organisation);

    return organisation;
  }
}

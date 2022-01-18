import {
  Controller,
  UseGuards,
  Get,
  Render,
  Param,
  Post,
  Body,
  UseFilters,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationsPresenter } from '../presenters/organisations.presenter';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';

import { ShowTemplate } from './interfaces/show-template.interface';
import { OrganisationDto } from './dto/organisation.dto';

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
    const organisationPresenter = new OrganisationPresenter(
      organisation,
      this.i18nService,
    );
    const professionPresenters = organisation.professions.map(
      (profession) => new ProfessionPresenter(profession, this.i18nService),
    );

    return {
      organisation,
      summaryList: await organisationPresenter.summaryList({
        removeBlank: true,
      }),
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
  ): Promise<Organisation> {
    const organisation = await this.organisationsService.findBySlug(slug);

    return { ...organisation, ...organisationDto };
  }
}

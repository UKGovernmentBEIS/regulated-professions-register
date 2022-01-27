import {
  Controller,
  UseGuards,
  Get,
  Render,
  Param,
  Body,
  UseFilters,
  Put,
  Post,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { OrganisationsService } from '../organisations.service';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationVersion } from '../organisation-version.entity';

import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationsPresenter } from './presenters/organisations.presenter';

import { ReviewTemplate } from './interfaces/review-template.interface';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationDto } from './dto/organisation.dto';
import { FilterDto } from './dto/filter.dto';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import { IndustriesService } from '../../industries/industries.service';
import { createFilterInput } from '../../helpers/create-filter-input.helper';

@UseGuards(AuthenticationGuard)
@Controller('/admin/organisations')
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly organisationsVersionsService: OrganisationVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('admin/organisations/index')
  @BackLink('/admin')
  async index(@Query() query: FilterDto = null): Promise<IndexTemplate> {
    const allOrganisations =
      await this.organisationsService.allWithProfessions();
    const allIndustries = await this.industriesService.all();

    const filter = query || new FilterDto();
    const filterInput = createFilterInput({ ...filter, allIndustries });

    const filteredOrganisations = new OrganisationsFilterHelper(
      allOrganisations,
    ).filter(filterInput);

    const presenter = new OrganisationsPresenter(
      allIndustries,
      filterInput,
      filteredOrganisations,
      this.i18nService,
    );

    return presenter.present();
  }

  @Get('/new')
  @Render('admin/organisations/new')
  @BackLink('/admin/organisations')
  async new() {
    // Do nothing
  }

  @Post('/')
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const blankOrganisation = new Organisation();
    const organisation = await this.organisationsService.save(
      blankOrganisation,
    );
    const blankVersion = {
      organisation: organisation,
      user: req.appSession.user,
    } as OrganisationVersion;
    const version = await this.organisationsVersionsService.save(blankVersion);

    return res.redirect(
      `/admin/organisations/${version.organisation.id}/versions/${version.id}/edit`,
    );
  }

  @Get('/:slug')
  @Render('admin/organisations/show')
  @BackLink('/admin/organisations')
  async show(@Param('slug') slug: string): Promise<ShowTemplate> {
    const organisation =
      await this.organisationsService.findBySlugWithProfessions(slug);

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      this.i18nService,
    );

    return organisationSummaryPresenter.present();
  }

  @Get('/:id/edit')
  @Render('admin/organisations/edit')
  @BackLink('/admin/organisations/:id')
  async edit(@Param('id') id: string): Promise<Organisation> {
    const organisation = await this.organisationsService.find(id);

    return organisation;
  }

  @Put('/:id')
  @UseFilters(new ValidationExceptionFilter('admin/organisations/edit'))
  async update(
    @Param('id') id: string,
    @Body() body: OrganisationDto,
    @Res() res: Response,
  ): Promise<void> {
    const organisation = await this.organisationsService.find(id);

    if (body.confirm) {
      return this.confirm(res, organisation);
    } else {
      const newOrganisation = {
        ...organisation,
        ...(body as Organisation),
      };

      const updatedOrganisation = await this.organisationsService.save(
        newOrganisation,
      );

      const organisationPresenter = new OrganisationPresenter(
        updatedOrganisation,
        this.i18nService,
      );

      return this.showReviewPage(res, {
        ...updatedOrganisation,
        summaryList: await organisationPresenter.summaryList({
          classes: 'govuk-summary-list',
          removeBlank: false,
          includeName: true,
          includeActions: true,
        }),
      });
    }
  }

  private async confirm(
    res: Response,
    organisation: Organisation,
  ): Promise<void> {
    // This should potentially add a confirmed flag to the object once
    // we have draft functionality in place
    await this.organisationsService.save(organisation);

    res.render('admin/organisations/complete', organisation);
  }

  private async showReviewPage(
    res: Response,
    template: ReviewTemplate,
  ): Promise<void> {
    return res.render('admin/organisations/review', {
      ...template,
      backLink: `/admin/organisations/${template.id}/edit/`,
    });
  }
}

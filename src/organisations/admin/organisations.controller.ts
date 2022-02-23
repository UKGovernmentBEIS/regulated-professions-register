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
import { Response, Request } from 'express';
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
import { BackLink } from '../../common/decorators/back-link.decorator';
import { IndexTemplate } from './interfaces/index-template.interface';

import { OrganisationDto } from './dto/organisation.dto';
import { FilterDto } from './dto/filter.dto';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import { IndustriesService } from '../../industries/industries.service';
import { createFilterInput } from '../../helpers/create-filter-input.helper';

import { flashMessage } from '../../common/flash-message';
import { isConfirmed } from '../../helpers/is-confirmed';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';

@UseGuards(AuthenticationGuard)
@Controller('/admin/organisations')
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Permissions(
    UserPermission.CreateOrganisation,
    UserPermission.EditOrganisation,
    UserPermission.DeleteOrganisation,
    UserPermission.PublishOrganisation,
  )
  @Render('admin/organisations/index')
  @BackLink('/admin')
  async index(
    @Req() request: RequestWithAppSession,
    @Query() query: FilterDto = null,
  ): Promise<IndexTemplate> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const allOrganisations =
      await this.organisationVersionsService.allDraftOrLive();
    const allIndustries = await this.industriesService.all();

    const filter = query || new FilterDto();

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

    const filterInput = createFilterInput({ ...filter, allIndustries });

    if (userOrganisation) {
      filterInput.organisations = [userOrganisation];
    }

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

  @Post('/')
  @Permissions(UserPermission.CreateOrganisation)
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
      user: getActingUser(req),
    } as OrganisationVersion;
    const version = await this.organisationVersionsService.save(blankVersion);

    return res.redirect(
      `/admin/organisations/${version.organisation.id}/versions/${version.id}/edit`,
    );
  }

  @Get('/:organisationId/versions/:versionId/edit')
  @Permissions(
    UserPermission.CreateOrganisation,
    UserPermission.EditOrganisation,
  )
  @Render('admin/organisations/edit')
  @BackLink('/admin/organisations/:id')
  async edit(
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
  ): Promise<Organisation> {
    const organisation = await this.organisationsService.findWithVersion(
      organisationId,
      versionId,
    );

    return organisation;
  }

  @Put('/:organisationId/versions/:versionId')
  @Permissions(
    UserPermission.CreateOrganisation,
    UserPermission.EditOrganisation,
  )
  @UseFilters(new ValidationExceptionFilter('admin/organisations/edit'))
  async update(
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
    @Body() body: OrganisationDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    const organisation = await this.organisationsService.find(organisationId);
    const version = await this.organisationVersionsService.find(versionId);

    if (body.confirm) {
      return this.confirm(res, req, organisation, version);
    } else {
      if (!isConfirmed(organisation)) {
        organisation.name = body.name;
        await this.organisationsService.save(organisation);
      }

      const newVersion = {
        ...version,
        ...OrganisationVersion.fromDto(body),
      };

      const updatedVersion = await this.organisationVersionsService.save(
        newVersion,
      );

      const updatedOrganisation = Organisation.withVersion(
        organisation,
        updatedVersion,
        true,
      );

      const organisationPresenter = new OrganisationPresenter(
        updatedOrganisation,
        this.i18nService,
      );

      return this.showReviewPage(res, organisation, version, {
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
    req: Request,
    organisation: Organisation,
    version: OrganisationVersion,
  ): Promise<void> {
    let action: string;

    if (!isConfirmed(organisation)) {
      action = 'create';
      await this.organisationsService.setSlug(organisation);
    } else {
      action = 'edit';
    }
    await this.organisationVersionsService.confirm(version);

    const messageTitle = await this.i18nService.translate(
      `organisations.admin.${action}.confirmation.heading`,
    );

    const messageBody = await this.i18nService.translate(
      `organisations.admin.${action}.confirmation.body`,
      { args: { name: organisation.name } },
    );

    req.flash('info', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/organisations/${organisation.id}/versions/${version.id}`,
    );
  }

  private async showReviewPage(
    res: Response,
    organisation: Organisation,
    version: OrganisationVersion,
    template: ReviewTemplate,
  ): Promise<void> {
    return res.render('admin/organisations/review', {
      ...template,
      backLink: `/admin/organisations/${organisation.id}/versions/${version.id}/edit/`,
    });
  }
}

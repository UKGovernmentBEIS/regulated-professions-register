import {
  Controller,
  UseGuards,
  Get,
  Render,
  Param,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

import { BackLink } from '../../common/decorators/back-link.decorator';

import { AuthenticationGuard } from '../../common/authentication.guard';

import { OrganisationVersionsService } from '../organisation-versions.service';

import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

import { Organisation } from '../organisation.entity';

import { ShowTemplate } from '../interfaces/show-template.interface';

import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';

import { getActingUser } from '../../users/helpers/get-acting-user.helper';
@UseGuards(AuthenticationGuard)
@Controller('/admin/organisations')
export class OrganisationVersionsController {
  constructor(
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('/:organisationID/versions')
  @Permissions(UserPermission.EditOrganisation)
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
    @Param('organisationID') organisationID: string,
  ): Promise<void> {
    const latestVersion =
      await this.organisationVersionsService.findLatestForOrganisationId(
        organisationID,
      );

    const newVersion = await this.organisationVersionsService.create(
      latestVersion,
      getActingUser(req),
    );

    return res.redirect(
      `/admin/organisations/${newVersion.organisation.id}/versions/${newVersion.id}/edit`,
    );
  }

  @Get(':organisationId/versions/:versionId')
  @Permissions(
    UserPermission.EditOrganisation,
    UserPermission.DeleteOrganisation,
    UserPermission.PublishOrganisation,
  )
  @Render('admin/organisations/show')
  @BackLink('/admin/organisations')
  async show(
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
  ): Promise<ShowTemplate> {
    const version =
      await this.organisationVersionsService.findByIdWithOrganisation(
        organisationId,
        versionId,
      );

    const organisation = Organisation.withVersion(
      version.organisation,
      version,
      true,
    );

    const organisationSummaryPresenter = new OrganisationSummaryPresenter(
      organisation,
      this.i18nService,
    );

    return organisationSummaryPresenter.present();
  }
}

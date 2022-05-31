import { Controller, Get, Param, Put, Render, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { escape } from '../../helpers/escape.helper';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { UserPermission } from '../../users/user-permission';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { OrganisationsService } from '../organisations.service';
import { Organisation } from '../organisation.entity';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';

@Controller('/admin/organisations')
export class OrganisationUnarchiveController {
  constructor(
    private organisationVersionsService: OrganisationVersionsService,
    private organisationsService: OrganisationsService,
    private i18nService: I18nService,
  ) {}

  @Get('/:organisationId/versions/:versionId/unarchive')
  @Permissions(UserPermission.PublishOrganisation)
  @Render('admin/organisations/unarchive/new')
  @BackLink('/admin/organisations/:organisationId/versions/:versionId')
  async new(
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ) {
    const version =
      await this.organisationVersionsService.findByIdWithOrganisation(
        organisationId,
        versionId,
      );
    const organisation = Organisation.withVersion(
      version.organisation,
      version,
    );

    checkCanViewOrganisation(req, organisation);

    return { organisation };
  }

  @Put(':organisationId/versions/:versionId/unarchive')
  @Permissions(UserPermission.PublishOrganisation)
  async create(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const organisation = await this.organisationsService.find(organisationId);
    const user = getActingUser(req);

    checkCanViewOrganisation(req, organisation);

    const currentVersion =
      await this.organisationVersionsService.findByIdWithOrganisation(
        organisationId,
        versionId,
      );

    const versionToUnarchive = await this.organisationVersionsService.create(
      currentVersion,
      user,
    );

    await this.organisationVersionsService.unarchive(versionToUnarchive);

    const messageTitle = await this.i18nService.translate(
      'organisations.admin.unarchive.confirmation.heading',
    );

    const messageBody = await this.i18nService.translate(
      'organisations.admin.unarchive.confirmation.body',
      { args: { name: escape(versionToUnarchive.organisation.name) } },
    );

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/organisations/${versionToUnarchive.organisation.id}/versions/${versionToUnarchive.id}`,
    );
  }
}

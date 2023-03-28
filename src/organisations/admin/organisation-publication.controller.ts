import { Controller, Get, Param, Put, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { escape } from '../../helpers/escape.helper';
import { isConfirmed } from '../../helpers/is-confirmed';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { UserPermission } from '../../users/user-permission';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationsService } from '../organisations.service';

@Controller('/admin/organisations')
export class OrganisationPublicationController {
  constructor(
    private organisationsService: OrganisationsService,
    private organisationVersionsService: OrganisationVersionsService,
    private i18nService: I18nService,
  ) {}

  @Get('/:organisationId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishOrganisation)
  @Render('admin/organisations/publication/new')
  @BackLink((request: Request) =>
    request.query.fromEdit === 'true'
      ? '/admin/organisations/:organisationId/versions/:versionId/edit'
      : '/admin/organisations/:organisationId/versions/:versionId',
  )
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

  @Put(':organisationId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishOrganisation)
  async create(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('organisationId') organisationId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const organisation = await this.organisationsService.find(organisationId);

    checkCanViewOrganisation(req, organisation);

    const version =
      await this.organisationVersionsService.findByIdWithOrganisation(
        organisationId,
        versionId,
      );

    const newVersion = await this.organisationVersionsService.create(
      version,
      getActingUser(req),
    );

    const confirmed = isConfirmed(organisation);

    if (!confirmed) {
      await this.organisationsService.setSlug(organisation);
    }

    await this.organisationVersionsService.publish(newVersion);

    const messageTitle = this.i18nService.translate<string>(
      'organisations.admin.publish.confirmation.heading',
    ) as string;

    const messageBody = this.i18nService.translate<string>(
      confirmed
        ? 'organisations.admin.publish.confirmation.body'
        : 'organisations.admin.publish.confirmation.bodyNew',
      { args: { name: escape(version.organisation.name) } },
    ) as string;

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/organisations/${newVersion.organisation.id}/versions/${newVersion.id}`,
    );
  }
}

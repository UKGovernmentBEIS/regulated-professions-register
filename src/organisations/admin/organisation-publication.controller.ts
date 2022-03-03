import { Controller, Get, Param, Put, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { UserPermission } from '../../users/user-permission';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';

@Controller('/admin/organisations')
export class OrganisationPublicationController {
  constructor(
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
    const version =
      await this.organisationVersionsService.findByIdWithOrganisation(
        organisationId,
        versionId,
      );

    const newVersion = await this.organisationVersionsService.create(
      version,
      getActingUser(req),
    );

    await this.organisationVersionsService.publish(newVersion);

    const messageTitle = await this.i18nService.translate(
      'organisations.admin.publish.confirmation.heading',
    );

    const messageBody = await this.i18nService.translate(
      'organisations.admin.publish.confirmation.body',
      { args: { name: version.organisation.name } },
    );

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/organisations/${newVersion.organisation.id}/versions/${newVersion.id}`,
    );
  }
}

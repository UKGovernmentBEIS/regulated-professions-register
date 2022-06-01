import {
  Controller,
  Get,
  Param,
  Delete,
  Render,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { escape } from '../../helpers/escape.helper';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { UserPermission } from '../../users/user-permission';
import { getLiveAndDraftProfessionsFromOrganisation } from '../helpers/get-live-and-draft-professions-from-organisation.helper';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';

@Controller('/admin/organisations')
export class OrganisationArchiveController {
  constructor(
    private organisationVersionsService: OrganisationVersionsService,
    private i18nService: I18nService,
  ) {}

  @Get('/:organisationId/versions/:versionId/archive')
  @Permissions(UserPermission.DeleteOrganisation)
  @Render('admin/organisations/archive/new')
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

    const professions = getLiveAndDraftProfessionsFromOrganisation(version);

    checkCanViewOrganisation(req, organisation);

    return { organisation, professions };
  }

  @Delete(':organisationId/versions/:versionId/archive')
  @Permissions(UserPermission.DeleteOrganisation)
  async delete(
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

    if (getLiveAndDraftProfessionsFromOrganisation(version).length) {
      throw new BadRequestException();
    }

    checkCanViewOrganisation(req, version.organisation);

    const user = getActingUser(req);

    const versionToArchive = await this.organisationVersionsService.create(
      version,
      user,
    );

    await this.organisationVersionsService.archive(versionToArchive);

    const messageTitle = this.i18nService.translate<string>(
      'organisations.admin.archive.confirmation.heading',
    );

    const messageBody = this.i18nService.translate<string>(
      'organisations.admin.archive.confirmation.body',
      { args: { name: escape(version.organisation.name) } },
    );

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/organisations/${versionToArchive.organisation.id}/versions/${versionToArchive.id}`,
    );
  }
}

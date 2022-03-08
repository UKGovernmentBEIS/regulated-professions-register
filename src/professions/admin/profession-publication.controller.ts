import { Controller, Get, Param, Put, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { escape } from '../../helpers/escape.helper';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { UserPermission } from '../../users/user-permission';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';

@Controller('/admin/professions')
export class ProfessionPublicationController {
  constructor(
    private professionVersionsService: ProfessionVersionsService,
    private i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishProfession)
  @Render('admin/professions/publication/new')
  @BackLink((request: Request) =>
    request.query.fromEdit === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId',
  )
  async new(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ) {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    const profession = Profession.withVersion(version.profession, version);

    return { profession };
  }

  @Put(':professionId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishProfession)
  async create(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    const newVersion = await this.professionVersionsService.create(
      version,
      getActingUser(req),
    );

    await this.professionVersionsService.publish(newVersion);

    const messageTitle = await this.i18nService.translate(
      'professions.admin.publish.confirmation.heading',
    );

    const messageBody = await this.i18nService.translate(
      'professions.admin.publish.confirmation.body',
      { args: { name: escape(version.profession.name) } },
    );

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/professions/${newVersion.profession.id}/versions/${newVersion.id}`,
    );
  }
}

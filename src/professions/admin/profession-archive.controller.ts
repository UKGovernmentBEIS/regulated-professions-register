import {
  Controller,
  Get,
  Param,
  Delete,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { escape } from '../../helpers/escape.helper';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { UserPermission } from '../../users/user-permission';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';

@Controller('/admin/professions')
export class ProfessionArchiveController {
  constructor(
    private professionVersionsService: ProfessionVersionsService,
    private i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/archive')
  @Permissions(UserPermission.DeleteProfession)
  @Render('admin/professions/archive/new')
  @BackLink('/admin/professions/:professionId/versions/:versionId')
  async new(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ) {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    const profession = Profession.withVersion(version.profession, version);

    checkCanChangeProfession(req, profession);

    return { profession };
  }

  @Delete(':professionId/versions/:versionId/archive')
  @Permissions(UserPermission.DeleteProfession)
  async delete(
    @Req() req: RequestWithAppSession,
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    checkCanChangeProfession(req, version.profession);

    const versionToBeArchived = await this.professionVersionsService.create(
      version,
      getActingUser(req),
    );

    await this.professionVersionsService.archive(versionToBeArchived);

    const messageTitle = this.i18nService.translate<string>(
      'professions.admin.archive.confirmation.heading',
    ) as string;

    const messageBody = this.i18nService.translate<string>(
      'professions.admin.archive.confirmation.body',
      { args: { name: escape(version.profession.name) } },
    ) as string;

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/professions/${versionToBeArchived.profession.id}/versions/${versionToBeArchived.id}`,
    );
  }
}

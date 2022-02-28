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
  ) {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    const profession = Profession.withVersion(version.profession, version);

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

    const versionToBeArchived = await this.professionVersionsService.create(
      version,
      getActingUser(req),
    );

    await this.professionVersionsService.archive(versionToBeArchived);

    const messageTitle = await this.i18nService.translate(
      'professions.admin.archive.confirmation.heading',
    );

    const messageBody = await this.i18nService.translate(
      'professions.admin.archive.confirmation.body',
      { args: { name: version.profession.name } },
    );

    req.flash('success', flashMessage(messageTitle, messageBody));

    res.redirect(
      `/admin/professions/${versionToBeArchived.profession.id}/versions/${versionToBeArchived.id}`,
    );
  }
}

import { Controller, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { ProfessionsService } from '../professions.service';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { ProfessionVersionsService } from '../profession-versions.service';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { escape } from '../../helpers/escape.helper';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ConfirmationController {
  constructor(
    private professionsService: ProfessionsService,
    private professionVersionsService: ProfessionVersionsService,
    private i18nService: I18nService,
  ) {}

  @Post('/:professionId/versions/:versionId/confirmation')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    let action: string;
    let bannerType: 'info' | 'success';

    if (profession.slug) {
      action = 'update';
      bannerType = 'info';
    } else {
      action = 'create';
      bannerType = 'success';
      await this.professionsService.setSlug(profession);
    }
    await this.professionVersionsService.confirm(version);

    const messageTitle = this.i18nService.translate<string>(
      `professions.admin.${action}.confirmation.heading`,
    ) as string;

    const messageBody = this.i18nService.translate<string>(
      `professions.admin.${action}.confirmation.body`,
      { args: { name: escape(profession.name) } },
    ) as string;

    req.flash(bannerType, flashMessage(messageTitle, messageBody));

    res.redirect(`/admin/professions/${profession.id}/versions/${version.id}`);
  }
}

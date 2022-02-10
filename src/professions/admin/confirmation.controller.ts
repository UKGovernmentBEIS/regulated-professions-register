import { Controller, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { ProfessionsService } from '../professions.service';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { ProfessionVersionsService } from '../profession-versions.service';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ConfirmationController {
  constructor(
    private professionsService: ProfessionsService,
    private professionVersionsService: ProfessionVersionsService,
    private i18nService: I18nService,
  ) {}

  @Post('/:professionId/versions/:versionId/confirmation')
  @Permissions(UserPermission.EditProfession)
  async create(
    @Res() res: Response,
    @Req() req: Request,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

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

    const messageTitle = await this.i18nService.translate(
      `professions.admin.${action}.confirmation.heading`,
    );

    const messageBody = await this.i18nService.translate(
      `professions.admin.${action}.confirmation.body`,
      { args: { name: profession.name } },
    );

    req.flash(bannerType, flashMessage(messageTitle, messageBody));

    res.redirect(`/admin/professions/${profession.id}/versions/${version.id}`);
  }
}

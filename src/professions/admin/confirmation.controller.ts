import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { ProfessionsService } from '../professions.service';
import { ConfirmationTemplate } from './interfaces/confirmation.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user.entity';
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
  @Permissions(UserPermission.CreateProfession)
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

    if (profession.confirmed) {
      action = 'update';
      bannerType = 'info';
      await this.professionVersionsService.confirm(version);
    } else {
      action = 'create';
      bannerType = 'success';
      await this.professionsService.confirm(profession);
      await this.professionVersionsService.confirm(version);
    }

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

  @Get('/:professionId/versions/:versionId/confirmation')
  @Permissions(UserPermission.CreateProfession)
  @Render('admin/professions/confirmation')
  async new(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('amended') amended: boolean,
  ): Promise<ConfirmationTemplate> {
    const profession = await this.professionsService.find(professionId);

    return { name: profession.name, amended: Boolean(amended) };
  }
}

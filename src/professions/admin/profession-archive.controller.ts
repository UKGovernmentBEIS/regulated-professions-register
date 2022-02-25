import { Controller, Get, Param, Put, Render, Req, Res } from '@nestjs/common';
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

}

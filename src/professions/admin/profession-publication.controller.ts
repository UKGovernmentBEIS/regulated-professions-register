import { Controller, Get, Param, Render } from '@nestjs/common';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';

@Controller('/admin/professions')
export class ProfessionPublicationController {
  constructor(private professionVersionsService: ProfessionVersionsService) {}

  @Get('/:professionId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishProfession)
  @Render('admin/professions/publication/new')
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

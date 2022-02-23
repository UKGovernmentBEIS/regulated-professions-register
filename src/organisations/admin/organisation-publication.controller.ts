import { Controller, Get, Param, Render } from '@nestjs/common';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';

@Controller('/admin/organisations')
export class OrganisationPublicationController {
  constructor(
    private organisationVersionsService: OrganisationVersionsService,
  ) {}

  @Get('/:organisationId/versions/:versionId/publish')
  @Permissions(UserPermission.PublishOrganisation)
  @Render('admin/organisations/publication/new')
  @BackLink('/admin/organisations/:organisationId/versions/:versionId')
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
}

import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class DecisionsController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly i18Service: I18nService,
  ) {}

  @Get()
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @Render('admin/decisions/index')
  @BackLink('/admin/dashboard')
  async index(@Req() request: RequestWithAppSession): Promise<IndexTemplate> {
    return this.createListEntries(request);
  }

  private async createListEntries(
    request: RequestWithAppSession,
  ): Promise<IndexTemplate> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

    const allDecisionDatasets = await (showAllOrgs
      ? this.decisionDatasetsService.all()
      : this.decisionDatasetsService.allForOrganisation(userOrganisation));

    return new DecisionDatasetsPresenter(
      userOrganisation,
      allDecisionDatasets,
      this.i18Service,
    ).present();
  }
}

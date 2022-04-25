import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from '../../professions/professions.service';
import {
  DecisionDatasetsPresenter,
  DecisionDatasetsPresenterView,
} from './presenters/decision-datasets.presenter';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { checkCanChangeDataset } from './helpers/check-can-change-dataset.helper';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class DecisionsController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
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

  @Get(':professionId/:organisationId/:year')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @Render('admin/decisions/show')
  @BackLink('/admin/decisions')
  async show(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Req() request: RequestWithAppSession,
  ): Promise<ShowTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    const organisation = dataset.organisation;

    checkCanChangeDataset(request, profession, organisation, year, true);

    const presenter = new DecisionDatasetPresenter(
      dataset.routes,
      this.i18nService,
    );

    return {
      profession,
      organisation,
      year,
      tables: presenter.tables(),
    };
  }

  private async createListEntries(
    request: RequestWithAppSession,
  ): Promise<IndexTemplate> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

    const view: DecisionDatasetsPresenterView = showAllOrgs
      ? 'overview'
      : 'single-organisation';

    const allDecisionDatasets = await (showAllOrgs
      ? this.decisionDatasetsService.all()
      : this.decisionDatasetsService.allForOrganisation(userOrganisation));

    return new DecisionDatasetsPresenter(
      userOrganisation,
      allDecisionDatasets,
      this.i18nService,
    ).present(view);
  }
}

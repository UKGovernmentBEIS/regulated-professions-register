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
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { ProfessionsService } from '../../professions/professions.service';
import { checkCanChangeDataset } from './helpers/check-can-change-dataset.helper';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ShowTemplate } from './interfaces/show-template.interface';
import { DecisionDatasetStatus } from '../decision-dataset.entity';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class ShowController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

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

    const presenter = new DecisionDatasetPresenter(dataset, this.i18nService);

    return {
      profession,
      organisation,
      year,
      tables: presenter.tables(),
      datasetStatus: dataset.status,
      isPublished: dataset.status === DecisionDatasetStatus.Live,
      changedBy: presenter.changedBy,
      lastModified: presenter.lastModified,
    };
  }
}

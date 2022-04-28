import {
  Controller,
  Get,
  Query,
  Render,
  Req,
  Res,
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
import {
  DecisionDatasetsPresenter,
  DecisionDatasetsPresenterView,
} from './presenters/decision-datasets.presenter';
import { FilterDto } from './dto/filter.dto';
import { createFilterInput } from '../../helpers/create-filter-input.helper';
import { getDecisionsYearsRange } from './helpers/get-decisions-years-range';
import { DecisionsCsvWriter } from './helpers/decisions-csv-writer.helper';
import { Response } from 'express';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { getQueryString } from './helpers/get-query-string.helper';
import { getExportTimestamp } from './helpers/get-export-timestamp.helper';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class DecisionsController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly organisationVersionsService: OrganisationVersionsService,
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
  async index(
    @Req() request: RequestWithAppSession,
    @Query() filter: FilterDto = null,
  ): Promise<IndexTemplate> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

    const view: DecisionDatasetsPresenterView = showAllOrgs
      ? 'overview'
      : 'single-organisation';

    const allOrganisations = await this.organisationVersionsService.allLive();

    const filterInput = createFilterInput({
      ...filter,
      allOrganisations,
    });

    const allDecisionDatasets = await (showAllOrgs
      ? this.decisionDatasetsService.all(filterInput)
      : this.decisionDatasetsService.allForOrganisation(
          userOrganisation,
          filterInput,
        ));

    const { start: startYear, end: endYear } = getDecisionsYearsRange();

    return {
      ...new DecisionDatasetsPresenter(
        filterInput,
        userOrganisation,
        allOrganisations,
        startYear,
        endYear,
        allDecisionDatasets,
        this.i18nService,
      ).present(view),
      filterQuery: getQueryString(request),
    };
  }

  @Get('export')
  @Permissions(UserPermission.DownloadDecisionData)
  async export(
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
    @Query() filter: FilterDto = null,
  ): Promise<void> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;
    const allOrganisations = await this.organisationVersionsService.allLive();

    const filterInput = createFilterInput({
      ...filter,
      allOrganisations,
    });

    const allDecisionDatasets = await (showAllOrgs
      ? this.decisionDatasetsService.all(filterInput)
      : this.decisionDatasetsService.allForOrganisation(
          userOrganisation,
          filterInput,
        ));

    const writer = new DecisionsCsvWriter(
      response,
      `decisions-${getExportTimestamp()}`,
      allDecisionDatasets,
      this.i18nService,
    );

    writer.write();
  }
}

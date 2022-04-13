import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionsService } from '../../professions/professions.service';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { DecisionDatasetsPresenter } from './presenters/decision-datasets.presenter';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import { EditTemplate } from './interfaces/edit-template.interface';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { EditDto } from './dto/edit.dto';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import { parseEditDtoDecisionRoutes } from './helpers/parse-edit-dto-decision-routes.helper';
import { modifyDecisionRoutes } from './helpers/modify-decision-routes.helper';

const emptyCountry = {
  country: null,
  decisions: {
    yes: null,
    no: null,
    yesAfterComp: null,
    noAfterComp: null,
  },
};

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class DecisionsController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
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
    @Param('year') year: string,
    @Req() request: RequestWithAppSession,
  ): Promise<ShowTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(request, profession);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      parseInt(year),
    );

    checkCanViewOrganisation(request, dataset.organisation);

    const presenter = new DecisionDatasetPresenter(
      dataset.routes,
      this.i18nService,
    );

    return {
      profession: profession,
      organisation: dataset.organisation,
      year: dataset.year.toString(),
      tables: presenter.tables(),
    };
  }

  @Get(':professionId/:organisationId/:year/edit')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @Render('admin/decisions/edit')
  async edit(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year') year: string,
    @Req() request: RequestWithAppSession,
  ): Promise<EditTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(request, profession);

    const organisation = await this.organisationsService.find(organisationId);

    checkCanViewOrganisation(request, organisation);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      parseInt(year),
    );

    const routes: DecisionRoute[] = dataset
      ? dataset.routes
      : [
          {
            name: '',
            countries: [emptyCountry],
          },
        ];

    return {
      year,
      profession,
      organisation,

      routes: new DecisionDatasetEditPresenter(
        routes,
        this.i18nService,
      ).present(),
    };
  }

  @Post(':professionId/:organisationId/:year/edit')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  async editPost(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year') year: string,
    @Body() editDto: EditDto,
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(request, profession);

    const organisation = await this.organisationsService.find(organisationId);

    checkCanViewOrganisation(request, organisation);

    const routes = parseEditDtoDecisionRoutes(editDto);

    const action = editDto.action;

    if (action === 'publish' || action === 'save') {
      const newDataset: DecisionDataset = {
        organisation,
        profession,
        user: getActingUser(request),
        year: parseInt(year),
        status:
          action === 'publish'
            ? DecisionDatasetStatus.Live
            : DecisionDatasetStatus.Draft,
        routes,
        updated_at: undefined,
        created_at: undefined,
      };

      await this.decisionDatasetsService.save(newDataset);

      response.redirect(
        `/admin/decisions/${profession.id}/${organisation.id}/${year}`,
      );
    } else {
      modifyDecisionRoutes(routes, action);

      response.render('admin/decisions/edit', {
        profession,
        organisation,
        year,
        routes: new DecisionDatasetEditPresenter(
          routes,
          this.i18nService,
        ).present(),
      } as EditTemplate);
    }
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
      this.i18nService,
    ).present();
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import {
  DecisionDatasetsPresenter,
  DecisionDatasetsPresenterView,
} from './presenters/decision-datasets.presenter';
import { DecisionDatasetPresenter } from '../presenters/decision-dataset.presenter';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { NewTemplate } from './interfaces/new-template.interface';
import { ProfessionVersionsService } from '../../professions/profession-versions.service';
import { Profession } from '../../professions/profession.entity';
import { EditTemplate } from './interfaces/edit-template.interface';
import { NewDto } from './dto/new.dto';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { EditDto } from './dto/edit.dto';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import { parseEditDtoDecisionRoutes } from './helpers/parse-edit-dto-decision-routes.helper';
import { modifyDecisionRoutes } from './helpers/modify-decision-routes.helper';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Organisation } from '../../organisations/organisation.entity';
import { getOrganisationsFromProfession } from '../../professions/helpers/get-organisations-from-profession.helper';
import { NewDecisionDatasetPresenter } from './presenters/new-decision-dataset.presenter';
import { checkCanChangeDataset } from './helpers/check-can-change-dataset.helper';
import { getDecisionsYearsRange } from './helpers/get-decisions-years-range';

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
    private readonly professionVersionsService: ProfessionVersionsService,
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

  @Get('/new')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @BackLink('/admin/decisions')
  async new(
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
  ): Promise<void> {
    return this.renderNew(null, null, null, request, response);
  }

  @Post('/new')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @BackLink('/admin/decisions')
  async newPost(
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
    @Body() newDto,
  ): Promise<void> {
    const actingUser = getActingUser(request);

    const validator = await Validator.validate(NewDto, newDto);
    const submittedValues = validator.obj;

    const professionId = submittedValues.profession;
    const organisationId = actingUser.serviceOwner
      ? submittedValues.organisation
      : actingUser.organisation.id;

    const year = submittedValues.year ? parseInt(submittedValues.year) : null;

    const profession = professionId
      ? await this.professionsService.findWithVersions(professionId)
      : null;
    const organisation = organisationId
      ? await this.organisationsService.find(organisationId)
      : null;

    let errors = {};

    if (!validator.valid()) {
      errors = {
        ...errors,
        ...new ValidationFailedError(validator.errors).fullMessages(),
      };
    }

    const existingDataset =
      validator.valid() &&
      (await this.decisionDatasetsService.find(
        profession.id,
        organisation.id,
        year,
      ));

    if (existingDataset) {
      errors = {
        ...errors,
        year: { text: 'decisions.admin.new.errors.year.exists' },
      };
    }

    const validOrganisationIds =
      profession &&
      organisation &&
      getOrganisationsFromProfession(profession).map(
        (organisation) => organisation.id,
      );

    if (
      profession &&
      organisation &&
      !validOrganisationIds.includes(organisationId)
    ) {
      errors = {
        ...errors,
        organisation: {
          text: 'decisions.admin.new.errors.organisation.notValidForProfession',
        },
      };
    }

    if (Object.keys(errors).length) {
      return this.renderNew(
        profession,
        organisation,
        year,
        request,
        response,
        errors,
      );
    } else {
      response.redirect(
        `/admin/decisions/${professionId}/${organisationId}/${year}/edit`,
      );
    }
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
    @Param('year', ParseIntPipe) year: number,
    @Req() request: RequestWithAppSession,
  ): Promise<EditTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

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
    @Param('year', ParseIntPipe) year: number,
    @Body() editDto: EditDto,
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

    const routes = parseEditDtoDecisionRoutes(editDto);

    const action = editDto.action;

    if (action === 'publish' || action === 'save') {
      const newDataset: DecisionDataset = {
        organisation,
        profession,
        user: getActingUser(request),
        year,
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

  private async renderNew(
    profession: Profession | null,
    organisation: Organisation | null,
    year: number | null,
    request: RequestWithAppSession,
    response: Response,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const actingUser = getActingUser(request);

    const showAllOrgs = actingUser.serviceOwner;

    const userOrganisation = showAllOrgs ? null : actingUser.organisation;

    const professions = (
      await (showAllOrgs
        ? this.professionVersionsService.allLive()
        : this.professionVersionsService.allLiveForOrganisation(
            userOrganisation,
          ))
    ).map((version) => Profession.withVersion(version.profession, version));

    const organisations = showAllOrgs
      ? await this.organisationVersionsService.allLive()
      : null;

    const { start: startYear, end: endYear } = getDecisionsYearsRange();

    const presenter = new NewDecisionDatasetPresenter(
      professions,
      organisations,
      startYear,
      endYear,
      profession,
      organisation,
      year,
      this.i18nService,
    );

    response.render('admin/decisions/new', {
      ...presenter.present(),
      errors,
    } as NewTemplate);
  }
}

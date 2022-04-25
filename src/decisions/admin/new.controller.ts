import {
  Body,
  Controller,
  Get,
  Post,
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
import { ProfessionsService } from '../../professions/professions.service';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { NewTemplate } from './interfaces/new-template.interface';
import { ProfessionVersionsService } from '../../professions/profession-versions.service';
import { Profession } from '../../professions/profession.entity';
import { NewDto } from './dto/new.dto';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Organisation } from '../../organisations/organisation.entity';
import { getOrganisationsFromProfession } from '../../professions/helpers/get-organisations-from-profession.helper';
import { NewDecisionDatasetPresenter } from './presenters/new-decision-dataset.presenter';
import { getDecisionsYearsRange } from './helpers/get-decisions-years-range';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class NewController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/new')
  @Permissions(
    UserPermission.UploadDecisionData,
    UserPermission.DownloadDecisionData,
    UserPermission.ViewDecisionData,
  )
  @BackLink('/admin/decisions')
  async edit(
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
  async update(
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

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Profession } from '../profession.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { ProfessionsService } from '../professions.service';
import {
  OrganisationsDto,
  ProfessionToOrganisationParams,
} from './dto/organisations.dto';
import { OrganisationsTemplate } from './interfaces/organisations.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from './presenters/regulated-authorities-select-presenter';
import { I18nService } from 'nestjs-i18n';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';
import { sortOrganisationsByRole } from '../helpers/sort-organisations-by-role';
import { ProfessionVersionStatus } from '../profession-version.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class OrganisationsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/organisations/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Query('change') change: string,
    @Req() req: RequestWithAppSession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    const professionToOrganisations = sortOrganisationsByRole(profession);

    return this.renderForm(
      res,
      professionToOrganisations,
      profession,
      change === 'true',
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/organisations')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async update(
    @Body() organisationsDto,
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    const validator = await Validator.validate(
      OrganisationsDto,
      organisationsDto,
    );

    const submittedValues = validator.obj;

    const professionToOrganisations = submittedValues.professionToOrganisations
      ? await Promise.all(
          submittedValues.professionToOrganisations.map(
            async (professionToOrganisation) => {
              return this.relationFromSubmittedValue(
                profession,
                professionToOrganisation,
              );
            },
          ),
        )
      : null;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        professionToOrganisations,
        profession,
        submittedValues.change,
        errors,
      );
    }

    const updatedProfession: Profession = {
      ...profession,
      ...{
        professionToOrganisations: professionToOrganisations,
      },
    };

    await this.professionsService.save(updatedProfession);

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    professionToOrganisations: ProfessionToOrganisation[],
    profession: Profession,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const organisations = await (this.hasLiveVersion(profession)
      ? this.organisationVersionsService.allLive()
      : this.organisationVersionsService.allLiveOrDraft());

    const selectArgsArray = await Promise.all(
      Array.from({
        ...professionToOrganisations,
        length: 25,
      }).map(async (professionToOrganisation) => {
        const presenter = new RegulatedAuthoritiesSelectPresenter(
          organisations,
          professionToOrganisation?.organisation,
          professionToOrganisation?.role,
          this.i18nService,
        );
        return presenter.authoritiesAndRoles();
      }),
    );

    const templateArgs: OrganisationsTemplate = {
      selectArgsArray,
      captionText: ViewUtils.captionText(this.i18nService, profession),
      change,
      errors,
    };

    return res.render('admin/professions/organisations', templateArgs);
  }

  private async fetchOrganisationFromSubmittedValue(
    professionToOrganisation: ProfessionToOrganisationParams,
  ): Promise<Organisation | null> {
    return professionToOrganisation.organisation
      ? await this.organisationsService.find(
          professionToOrganisation.organisation,
        )
      : null;
  }

  private async relationFromSubmittedValue(
    profession: Profession,
    submittedValue: ProfessionToOrganisationParams,
  ): Promise<ProfessionToOrganisation> {
    const organisation = await this.fetchOrganisationFromSubmittedValue(
      submittedValue,
    );

    return organisation
      ? new ProfessionToOrganisation(
          organisation,
          profession,
          submittedValue.role as OrganisationRole,
        )
      : null;
  }

  private hasLiveVersion(profession: Profession): boolean {
    return profession.versions.some(
      (version) => version.status === ProfessionVersionStatus.Live,
    );
  }
}

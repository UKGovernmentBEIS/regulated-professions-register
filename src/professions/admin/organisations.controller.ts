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
import { ProfessionsService } from '../professions.service';
import { OrganisationsDto } from './dto/organisations.dto';
import { OrganisationsTemplate } from './interfaces/organisations.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from './presenters/regulated-authorities-select-presenter';
import { Organisation } from '../../organisations/organisation.entity';
import { I18nService } from 'nestjs-i18n';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { getOrganisationsFromProfession } from '../helpers/get-organisations-from-profession.helper';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';

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

    checkCanViewProfession(req, profession);

    const organisations = getOrganisationsFromProfession(profession);

    return this.renderForm(
      res,
      organisations ? organisations[0] : undefined,
      organisations ? organisations[1] : undefined,
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

    checkCanViewProfession(req, profession);

    const validator = await Validator.validate(
      OrganisationsDto,
      organisationsDto,
    );

    const submittedValues = validator.obj;

    const selectedOrganisation = submittedValues.regulatoryBody
      ? await this.organisationsService.find(submittedValues.regulatoryBody)
      : null;

    const professionToOrganisations = [
      new ProfessionToOrganisation(
        selectedOrganisation,
        profession,
        OrganisationRole.PrimaryRegulator,
      ),
    ];

    let selectedAdditionalOrganisation = null;

    if (submittedValues.additionalRegulatoryBody) {
      selectedAdditionalOrganisation = await this.organisationsService.find(
        submittedValues.additionalRegulatoryBody,
      );

      professionToOrganisations.push(
        new ProfessionToOrganisation(
          selectedAdditionalOrganisation,
          profession,
          OrganisationRole.PrimaryRegulator,
        ),
      );
    }

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        selectedOrganisation,
        selectedAdditionalOrganisation,
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
    selectedRegulatoryAuthority: Organisation | null,
    selectedAdditionalRegulatoryAuthority: Organisation | null,
    profession: Profession,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const regulatedAuthorities =
      await this.organisationVersionsService.allLive();

    const regulatedAuthoritiesSelectArgs =
      new RegulatedAuthoritiesSelectPresenter(
        regulatedAuthorities,
        selectedRegulatoryAuthority,
      ).selectArgs();

    const additionalRegulatedAuthoritiesSelectArgs =
      new RegulatedAuthoritiesSelectPresenter(
        regulatedAuthorities,
        selectedAdditionalRegulatoryAuthority,
      ).selectArgs();

    const templateArgs: OrganisationsTemplate = {
      regulatedAuthoritiesSelectArgs,
      additionalRegulatedAuthoritiesSelectArgs,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      change,
      errors,
    };

    return res.render('admin/professions/organisations', templateArgs);
  }
}

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
import { I18nService } from 'nestjs-i18n';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
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
      organisations,
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

    const regulatoryBodies = submittedValues.regulatoryBodies
      ? await Promise.all(
          submittedValues.regulatoryBodies.map(async (regulatoryBody) => {
            return regulatoryBody
              ? await this.organisationsService.find(regulatoryBody)
              : null;
          }),
        )
      : null;

    const professionToOrganisations = regulatoryBodies
      ? await Promise.all(
          regulatoryBodies.map(async (regulatoryBody) => {
            return regulatoryBody
              ? new ProfessionToOrganisation(
                  regulatoryBody,
                  profession,
                  OrganisationRole.PrimaryRegulator,
                )
              : null;
          }),
        )
      : null;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        regulatoryBodies,
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
    organisations: Organisation[],
    profession: Profession,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const regulatedAuthorities =
      await this.organisationVersionsService.allLive();

    const selectArgsArray = await Promise.all(
      Array.from({
        ...profession.professionToOrganisations,
        length: 5,
      }).map(async (professionToOrganisation) => {
        const presenter = new RegulatedAuthoritiesSelectPresenter(
          regulatedAuthorities,
          professionToOrganisation?.organisation,
          professionToOrganisation?.role,
        );
        return await presenter.authoritiesAndRoles(this.i18nService);
      }),
    );

    const templateArgs: OrganisationsTemplate = {
      selectArgsArray,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      change,
      errors,
    };

    return res.render('admin/professions/organisations', templateArgs);
  }
}

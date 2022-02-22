import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';
import { TopLevelDetailsTemplate } from './interfaces/top-level-details.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { isConfirmed } from '../../helpers/is-confirmed';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';
import { Organisation } from '../../organisations/organisation.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
  ) {}

  @Get('/:professionId/versions/:versionId/top-level-information/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Query('change') change: string,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    return this.renderForm(
      res,
      profession.name,
      profession.organisation,
      profession.additionalOrganisation,
      isConfirmed(profession),
      change === 'true',
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/top-level-information')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async update(
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    const submittedValues: TopLevelDetailsDto = topLevelDetailsDto;

    const selectedOrganisation = submittedValues.regulatoryBody
      ? await this.organisationsService.find(submittedValues.regulatoryBody)
      : null;

    const selectedAdditionalOrganisation =
      submittedValues.additionalRegulatoryBody
        ? await this.organisationsService.find(
            submittedValues.additionalRegulatoryBody,
          )
        : null;

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        submittedValues.name,
        selectedOrganisation,
        selectedAdditionalOrganisation,
        isConfirmed(profession),
        submittedValues.change === 'true',
        errors,
      );
    }

    const updatedProfession: Profession = {
      ...profession,
      ...{
        name: submittedValues.name,
        organisation: selectedOrganisation,
        additionalOrganisation: selectedAdditionalOrganisation,
      },
    };

    await this.professionsService.save(updatedProfession);

    if (submittedValues.change === 'true') {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/scope/edit`,
    );
  }

  private async renderForm(
    res: Response,
    name: string,
    selectedRegulatoryAuthority: Organisation | null,
    selectedAdditionalRegulatoryAuthority: Organisation | null,
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const regulatedAuthorities = await this.organisationsService.all();

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

    const templateArgs: TopLevelDetailsTemplate = {
      name,
      regulatedAuthoritiesSelectArgs,
      additionalRegulatedAuthoritiesSelectArgs,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/top-level-information', templateArgs);
  }
}

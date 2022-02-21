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
import { AuthenticationGuard } from '../../common/authentication.guard';
import { ProfessionsService } from '../professions.service';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatoryBodyTemplate } from './interfaces/regulatory-body.template';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';
import { Organisation } from '../../organisations/organisation.entity';
import { Validator } from '../../helpers/validator';
import { RegulatoryBodyDto } from './dto/regulatory-body.dto';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { isConfirmed } from '../../helpers/is-confirmed';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatoryBodyController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/regulatory-body/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/scope/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    return this.renderForm(
      res,
      profession.organisation,
      profession.additionalOrganisation,
      isConfirmed(profession),
      change,
    );
  }

  @Post('/:professionId/versions/:versionId/regulatory-body')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/scope/edit',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() regulatoryBodyDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      RegulatoryBodyDto,
      regulatoryBodyDto,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const submittedValues: RegulatoryBodyDto = regulatoryBodyDto;

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
        selectedOrganisation,
        selectedAdditionalOrganisation,
        isConfirmed(profession),
        regulatoryBodyDto.change,
        errors,
      );
    }

    const updatedProfession: Profession = {
      ...profession,
      organisation: selectedOrganisation,
      additionalOrganisation: selectedAdditionalOrganisation,
    };

    await this.professionsService.save(updatedProfession);

    if (regulatoryBodyDto.change) {
      return res.redirect(
        `/admin/professions/${version.profession.id}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${versionId}/registration/edit`,
    );
  }

  private async renderForm(
    res: Response,
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

    const templateArgs: RegulatoryBodyTemplate = {
      regulatedAuthoritiesSelectArgs,
      additionalRegulatedAuthoritiesSelectArgs,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/regulatory-body', templateArgs);
  }
}

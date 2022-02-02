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
import { MandatoryRegistration, Profession } from '../profession.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { MandatoryRegistrationRadioButtonsPresenter } from './mandatory-registration-radio-buttons-presenter';
import { Validator } from '../../helpers/validator';
import { RegulatoryBodyDto } from './dto/regulatory-body.dto';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatoryBodyController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:id/regulatory-body/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:id/check-your-answers'
      : '/admin/professions/:id/top-level-information/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    const selectedMandatoryRegistration = profession.mandatoryRegistration;

    return this.renderForm(
      res,
      profession.organisation,
      selectedMandatoryRegistration,
      profession.confirmed,
      change,
    );
  }

  @Post('/:id/regulatory-body')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:id/check-your-answers'
      : '/admin/professions/:id/top-level-information/edit',
  )
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() regulatoryBodyDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      RegulatoryBodyDto,
      regulatoryBodyDto,
    );

    const profession = await this.professionsService.find(id);

    const submittedValues: RegulatoryBodyDto = regulatoryBodyDto;

    const selectedOrganisation = await this.organisationsService.find(
      submittedValues.regulatoryBody,
    );

    const selectedMandatoryRegistration = submittedValues.mandatoryRegistration;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        selectedOrganisation,
        selectedMandatoryRegistration,
        profession.confirmed,
        regulatoryBodyDto.change,
        errors,
      );
    }

    const updated: Profession = {
      ...profession,
      ...{
        organisation: selectedOrganisation,
        mandatoryRegistration: selectedMandatoryRegistration,
      },
    };

    await this.professionsService.save(updated);

    if (regulatoryBodyDto.change) {
      return res.redirect(`/admin/professions/${id}/check-your-answers`);
    }

    return res.redirect(`/admin/professions/${id}/regulated-activities/edit`);
  }

  private async renderForm(
    res: Response,
    selectedRegulatoryAuthority: Organisation | null,
    mandatoryRegistration: MandatoryRegistration | null,
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

    const mandatoryRegistrationRadioButtonArgs =
      await new MandatoryRegistrationRadioButtonsPresenter(
        mandatoryRegistration,
        this.i18nService,
      ).radioButtonArgs();

    const templateArgs: RegulatoryBodyTemplate = {
      regulatedAuthoritiesSelectArgs,
      mandatoryRegistrationRadioButtonArgs,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/regulatory-body', templateArgs);
  }
}

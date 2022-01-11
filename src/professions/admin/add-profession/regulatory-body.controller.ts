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
import { Response } from 'express';
import { ProfessionsService } from '../../professions.service';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../../organisations/organisations.service';
import { RegulatoryBodyTemplate } from './interfaces/regulatory-body.template';
import { RegulatedAuthoritiesSelectPresenter } from '../regulated-authorities-select-presenter';
import { MandatoryRegistration, Profession } from '../../profession.entity';
import { Organisation } from '../../../organisations/organisation.entity';
import { MandatoryRegistrationRadioButtonsPresenter } from '../mandatory-registration-radio-buttons-presenter';
import { Validator } from '../../../helpers/validator';
import { RegulatoryBodyDto } from './dto/regulatory-body.dto';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { AuthenticationGuard } from '../../../common/authentication.guard';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegulatoryBodyController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:id/regulatory-body/edit')
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    const selectedMandatoryRegistration = profession.mandatoryRegistration;

    return this.renderForm(
      res,
      profession.organisation,
      selectedMandatoryRegistration,
      change,
      this.backLink(change, id),
      errors,
    );
  }

  @Post('/:id/regulatory-body')
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
        regulatoryBodyDto.change,
        this.backLink(regulatoryBodyDto.change, id),
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
    change: boolean,
    backLink: string,
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
      change,
      backLink,
      errors,
    };

    return res.render(
      'professions/admin/add-profession/regulatory-body',
      templateArgs,
    );
  }

  private backLink(change: boolean, id: string) {
    return change
      ? `/admin/professions/${id}/check-your-answers`
      : `/admin/professions/${id}/top-level-information/edit`;
  }
}

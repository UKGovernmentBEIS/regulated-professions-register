import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
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

    const selectedMandatoryRegistration: MandatoryRegistration =
      profession.mandatoryRegistration as MandatoryRegistration;

    return this.renderForm(
      res,
      profession.organisation,
      selectedMandatoryRegistration,
      change,
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

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        await this.getSelectedOrganisationFromDtoThenProfession(
          profession,
          regulatoryBodyDto,
        ),
        this.getSelectedMandatoryRegistrationFromDtoThenProfession(
          profession,
          regulatoryBodyDto,
        ),
        regulatoryBodyDto.change,
        errors,
      );
    }

    const regulatoryBodyAnswers: RegulatoryBodyDto = regulatoryBodyDto;

    const organisation = await this.organisationsService.find(
      regulatoryBodyAnswers.regulatoryBody,
    );

    const selectedMandatoryRegistration: MandatoryRegistration =
      regulatoryBodyDto.mandatoryRegistration as MandatoryRegistration;

    const updated: Profession = {
      ...profession,
      ...{
        organisation: organisation,
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
      errors,
    };

    return res.render(
      'professions/admin/add-profession/regulatory-body',
      templateArgs,
    );
  }

  async getSelectedOrganisationFromDtoThenProfession(
    profession: Profession,
    regulatoryBodyDto: RegulatoryBodyDto,
  ): Promise<Organisation> {
    return regulatoryBodyDto.regulatoryBody
      ? await this.organisationsService.find(regulatoryBodyDto.regulatoryBody)
      : profession.organisation;
  }

  getSelectedMandatoryRegistrationFromDtoThenProfession(
    profession: Profession,
    regulatoryBodyDto: RegulatoryBodyDto,
  ): MandatoryRegistration {
    const selectedMandatoryRegistration =
      regulatoryBodyDto.mandatoryRegistration ||
      profession.mandatoryRegistration;

    return selectedMandatoryRegistration as MandatoryRegistration;
  }
}

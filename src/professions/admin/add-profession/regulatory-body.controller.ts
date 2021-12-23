import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProfessionsService } from '../../professions.service';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../../organisations/organisations.service';
import { RegulatoryBodyTemplate } from './interfaces/regulatory-body.template';
import { RegulatedAuthoritiesSelectPresenter } from '../regulated-authorities-select-presenter';
import { MandatoryRegistration } from '../../profession.entity';
import { Organisation } from '../../../organisations/organisation.entity';
import { MandatoryRegistrationRadioButtonsPresenter } from '../mandatory-registration-radio-buttons-presenter';

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
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    const selectedMandatoryRegistration: MandatoryRegistration =
      profession.mandatoryRegistration as MandatoryRegistration;

    return this.renderForm(
      res,
      profession.organisation,
      selectedMandatoryRegistration,
      errors,
    );
  }

  @Post('/:id/regulatory-body')
  async update(@Res() res: Response, @Param('id') id: string): Promise<void> {
    return res.redirect(`/admin/professions/${id}/check-your-answers`);
  }

  private async renderForm(
    res: Response,
    selectedRegulatoryAuthority: Organisation | null,
    mandatoryRegistration: MandatoryRegistration | null,
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
      errors,
    };

    return res.render(
      'professions/admin/add-profession/regulatory-body',
      templateArgs,
    );
  }
}

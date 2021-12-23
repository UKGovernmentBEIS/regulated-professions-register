import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Validator } from '../../../helpers/validator';
import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../../industries/industry.entity';
import { TopLevelDetailsTemplate } from './interfaces/top-level-details.template';

@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:id/top-level-information/edit')
  async edit(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('change') change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.find(id);

    return this.renderForm(
      res,
      profession.name,
      profession.industries || [],
      profession.occupationLocations || [],
      change,
      errors,
    );
  }

  @Post('/:id/top-level-information')
  async update(
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    const profession = await this.professionsService.find(id);

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        topLevelDetailsDto.name || profession.name,
        await this.getSelectedIndustriesFromDtoThenProfession(
          profession,
          topLevelDetailsDto,
        ),
        this.getSelectedNationsFromDtoThenProfession(
          profession,
          topLevelDetailsDto,
        ),
        topLevelDetailsDto.change,
        errors,
      );
    }

    const topLevelDetails: TopLevelDetailsDto = topLevelDetailsDto;

    const industries = await this.industriesService.findByIds(
      topLevelDetails.industries,
    );

    const updated: Profession = {
      ...profession,
      ...{
        name: topLevelDetailsDto.name,
        occupationLocations: topLevelDetails.nations,
        industries: industries,
      },
    };

    await this.professionsService.save(updated);

    if (topLevelDetailsDto.change) {
      return res.redirect(`/admin/professions/${id}/check-your-answers`);
    }

    // This will be the next page in the journey, but for now is the same as above
    return res.redirect(`/admin/professions/${id}/check-your-answers`);
  }

  private async renderForm(
    res: Response,
    name: string,
    selectedIndustries: Industry[],
    selectedNations: string[],
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      industries,
      selectedIndustries,
      this.i18nService,
    ).checkboxArgs();

    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      Nation.all(),
      selectedNations.map((nationCode) => Nation.find(nationCode)),
      this.i18nService,
    ).checkboxArgs();

    const templateArgs: TopLevelDetailsTemplate = {
      name,
      industriesCheckboxArgs,
      nationsCheckboxArgs,
      change,
      errors,
    };

    return res.render(
      'professions/admin/add-profession/top-level-information',
      templateArgs,
    );
  }

  async getSelectedIndustriesFromDtoThenProfession(
    profession: Profession,
    topLevelDetailsDto: TopLevelDetailsDto,
  ): Promise<Industry[]> {
    return topLevelDetailsDto.industries
      ? await this.industriesService.findByIds(topLevelDetailsDto.industries)
      : profession.industries || [];
  }

  getSelectedNationsFromDtoThenProfession(
    profession: Profession,
    topLevelDetailsDto: TopLevelDetailsDto,
  ): string[] {
    return topLevelDetailsDto.nations || profession.occupationLocations || [];
  }
}

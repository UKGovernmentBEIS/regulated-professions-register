import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
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
import { TopLevelDetailsTemplate } from './interfaces/top-level-details.template';
import { I18nService } from 'nestjs-i18n';

@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:id/top-level-information/edit')
  @Render('professions/admin/add-profession/top-level-information')
  async edit(
    @Param('id') id: string,
    errors: object | undefined = undefined,
  ): Promise<TopLevelDetailsTemplate> {
    const profession = await this.professionsService.find(id);

    const industries = await this.industriesService.all();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      industries,
      profession.industries || [],
      this.i18nService,
    ).checkboxArgs();

    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      Nation.all(),
      (profession.occupationLocations || []).map((nationCode) =>
        Nation.find(nationCode),
      ),
      this.i18nService,
    ).checkboxArgs();

    return {
      name: profession.name,
      industriesCheckboxArgs,
      nationsCheckboxArgs,
      errors,
    };
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

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.edit(id, errors);
      return;
    }

    const topLevelDetails: TopLevelDetailsDto = topLevelDetailsDto;

    const industries = await this.industriesService.findByIds(
      topLevelDetails.industries,
    );

    const profession = await this.professionsService.find(id);

    const updated: Profession = {
      ...profession,
      ...{
        name: topLevelDetailsDto.name,
        occupationLocations: topLevelDetails.nations,
        industries: industries,
      },
    };

    await this.professionsService.save(updated);

    res.redirect(`/admin/professions/${id}/check-your-answers`);
  }
}

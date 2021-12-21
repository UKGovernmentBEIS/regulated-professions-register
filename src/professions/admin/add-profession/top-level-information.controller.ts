import { Body, Controller, Get, Post, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Validator } from '../../../helpers/validator';
import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('admin/professions/new/top-level-information')
export class TopLevelInformationController {
  constructor(
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  async new(
    @Res() res: Response,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      industries,
    ).checkboxArgs(this.i18nService);
    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      Nation.all(),
    ).checkboxArgs(this.i18nService);

    res.render('professions/admin/add-profession/top-level-information', {
      industriesCheckboxArgs,
      nationsCheckboxArgs,
      errors,
    });
  }

  @Post()
  async addTopLevelInformation(
    @Session() session: Record<string, any>,
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
  ): Promise<void> {
    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      await this.new(res, errors);
      return;
    }

    if (session['add-profession'] === undefined) {
      session['add-profession'] = {};
    }

    session['add-profession']['top-level-details'] = topLevelDetailsDto;

    res.redirect('/admin/professions/new/check-your-answers');
  }
}

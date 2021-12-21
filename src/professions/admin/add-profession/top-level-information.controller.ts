import { Body, Controller, Get, Post, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { IndustriesCheckboxPresenter } from '../../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../../nations/nations-checkbox.presenter';
import { Validator } from '../../../helpers/validator';
import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';

@Controller('admin/professions/new/top-level-information')
export class TopLevelInformationController {
  constructor(private industriesService: IndustriesService) {}

  @Get()
  async new(
    @Res() res: Response,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxArgs = new IndustriesCheckboxPresenter(
      industries,
    ).checkboxArgs();
    const nationsCheckboxArgs = new NationsCheckboxPresenter(
      Nation.all(),
    ).checkboxArgs();

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
      this.new(res, errors);
      return;
    }

    if (session['add-profession'] === undefined) {
      session['add-profession'] = {};
    }

    session['add-profession']['top-level-details'] = topLevelDetailsDto;

    res.redirect('/admin/professions/new/check-your-answers');
  }
}

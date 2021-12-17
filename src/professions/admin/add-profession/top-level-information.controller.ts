import { Body, Controller, Get, Post, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { Validator } from '../../../helpers/validator';
import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { ValidationFailedError } from '../../../validation/validation-failed.error';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';

@Controller('admin/professions/new/top-level-information')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly industriesService: IndustriesService,
  ) {}

  @Get()
  async new(
    @Res() res: Response,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxArgs = industries.map((industry) => ({
      text: industry.name,
      value: industry.id,
    }));

    const nationsCheckboxArgs = Nation.all().map((nation) => ({
      text: nation.name,
      value: nation.code,
    }));

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

    const topLevelDetails: TopLevelDetailsDto = topLevelDetailsDto;

    const industries = await this.industriesService.findByIds(
      topLevelDetails.industries,
    );

    const draftProfession: Profession = await this.professionsService.confirm(
      new Profession(
        topLevelDetails.name,
        null,
        null,
        null,
        topLevelDetails.nations,
        null,
        industries,
      ),
    );

    session['draft-profession-id'] = draftProfession.id;

    res.redirect('/admin/professions/new/check-your-answers');
  }
}

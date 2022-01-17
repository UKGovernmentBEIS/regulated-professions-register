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
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { Validator } from '../../helpers/validator';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { TopLevelDetailsTemplate } from './interfaces/top-level-details.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user.entity';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:id/top-level-information/edit')
  @Permissions(UserPermission.CreateProfession)
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
      this.backLink(change, id),
      errors,
    );
  }

  @Post('/:id/top-level-information')
  @Permissions(UserPermission.CreateProfession)
  async update(
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    const submittedValues: TopLevelDetailsDto = topLevelDetailsDto;

    const profession = await this.professionsService.find(id);

    const submittedIndustries = await this.industriesService.findByIds(
      submittedValues.industries || [],
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        submittedValues.name,
        submittedIndustries,
        submittedValues.nations || [],
        submittedValues.change,
        this.backLink(submittedValues.change, id),
        errors,
      );
    }

    const updated: Profession = {
      ...profession,
      ...{
        name: submittedValues.name,
        occupationLocations: submittedValues.nations,
        industries: submittedIndustries,
      },
    };

    await this.professionsService.save(updated);

    if (submittedValues.change) {
      return res.redirect(`/admin/professions/${id}/check-your-answers`);
    }

    return res.redirect(`/admin/professions/${id}/regulatory-body/edit`);
  }

  private async renderForm(
    res: Response,
    name: string,
    selectedIndustries: Industry[],
    selectedNations: string[],
    change: boolean,
    backLink: string,
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
      backLink,
      errors,
    };

    return res.render('admin/professions/top-level-information', templateArgs);
  }

  private backLink(change: boolean, id: string) {
    return change
      ? `/admin/professions/${id}/check-your-answers`
      : '/admin/professions';
  }
}

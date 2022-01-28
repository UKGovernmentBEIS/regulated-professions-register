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
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionVersion } from '../profession-version.entity';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class TopLevelInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/top-level-information/edit')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      profession.name,
      version.industries || [],
      version.occupationLocations || [],
      profession.confirmed,
      change,
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/top-level-information')
  @Permissions(UserPermission.CreateProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/check-your-answers'
      : '/admin/professions',
  )
  async update(
    @Body() topLevelDetailsDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const validator = await Validator.validate(
      TopLevelDetailsDto,
      topLevelDetailsDto,
    );

    const submittedValues: TopLevelDetailsDto = topLevelDetailsDto;

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

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
        profession.confirmed,
        errors,
      );
    }

    const updatedProfession: Profession = {
      ...profession,
      ...{
        name: submittedValues.name,
      },
    };

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        occupationLocations: submittedValues.nations,
        industries: submittedIndustries,
      },
    };

    await this.professionsService.save(updatedProfession);
    await this.professionVersionsService.save(updatedVersion);

    if (submittedValues.change) {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/regulatory-body/edit`,
    );
  }

  private async renderForm(
    res: Response,
    name: string,
    selectedIndustries: Industry[],
    selectedNations: string[],
    isEditing: boolean,
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
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/top-level-information', templateArgs);
  }
}

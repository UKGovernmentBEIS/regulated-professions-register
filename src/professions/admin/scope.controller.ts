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
import { ProfessionsService } from '../professions.service';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { ScopeTemplate } from './interfaces/scope.template';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { BackLink } from '../../common/decorators/back-link.decorator';

import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionVersion } from '../profession-version.entity';
import { isConfirmed } from '../../helpers/is-confirmed';
import { allNations, isUK } from '../../helpers/nations.helper';
import { ScopeDto } from './dto/scope.dto';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ScopeController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/scope/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/top-level-information/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: string,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const coversUK = version.occupationLocations
      ? isUK(version.occupationLocations)
      : null;

    return this.renderForm(
      res,
      coversUK,
      version.industries || [],
      version.occupationLocations || [],
      isConfirmed(profession),
      change === 'true',
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/scope')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/top-level-information/edit',
  )
  async update(
    @Body() scopeDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const validator = await Validator.validate(ScopeDto, scopeDto);

    const submittedValues: ScopeDto = scopeDto;
    const coversUK = Boolean(Number(submittedValues.coversUK));

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
        coversUK,
        submittedIndustries,
        submittedValues.nations || [],
        isConfirmed(profession),
        submittedValues.change === 'true',
        errors,
      );
    }

    if (coversUK) {
      submittedValues.nations = allNations();
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        occupationLocations: submittedValues.nations,
        industries: submittedIndustries,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    if (submittedValues.change === 'true') {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/registration/edit`,
    );
  }

  private async renderForm(
    res: Response,
    coversUK: boolean,
    selectedIndustries: Industry[],
    selectedNations: string[],
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxItems = await new IndustriesCheckboxPresenter(
      industries,
      selectedIndustries,
      this.i18nService,
    ).checkboxItems();

    const nationsCheckboxPresenter = new NationsCheckboxPresenter(
      Nation.all(),
      selectedNations.map((nationCode) => Nation.find(nationCode)),
      this.i18nService,
    );

    const nationsCheckboxArgs = await nationsCheckboxPresenter.checkboxArgs(
      'nations',
      'nations[]',
      'professions.form.checkboxes.hint',
    );

    const templateArgs: ScopeTemplate = {
      coversUK,
      industriesCheckboxItems,
      nationsCheckboxArgs,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/scope', templateArgs);
  }
}
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
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
import { allNations, isUK } from '../../helpers/nations.helper';
import { ScopeDto } from './dto/scope.dto';
import { Profession } from '../profession.entity';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

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
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const profession =
      await this.professionsService.findWithVersions(professionId);

    checkCanChangeProfession(req, profession);

    const version =
      await this.professionVersionsService.findWithProfession(versionId);

    const coversUK = version.occupationLocations
      ? isUK(version.occupationLocations)
      : null;

    return this.renderForm(
      res,
      coversUK,
      version.industries || [],
      version.occupationLocations || [],
      profession,
      errors,
    );
  }

  @Post('/:professionId/versions/:versionId/scope')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async update(
    @Body() scopeDto, // unfortunately we can't type this here without a validation error being thrown outside of this
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const validator = await Validator.validate(ScopeDto, scopeDto);
    const submittedValues = validator.obj;

    const coversUK = Boolean(Number(submittedValues.coversUK));

    const profession =
      await this.professionsService.findWithVersions(professionId);

    checkCanChangeProfession(req, profession);

    const version =
      await this.professionVersionsService.findWithProfession(versionId);

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
        profession,
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

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    coversUK: boolean,
    selectedIndustries: Industry[],
    selectedNations: string[],
    profession: Profession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const industries = await this.industriesService.all();

    const industriesCheckboxItems = new IndustriesCheckboxPresenter(
      industries,
      selectedIndustries,
      this.i18nService,
    ).checkboxItems();

    const nationsCheckboxPresenter = new NationsCheckboxPresenter(
      Nation.all(),
      selectedNations.map((nationCode) => Nation.find(nationCode)),
      this.i18nService,
    );

    const nationsCheckboxArgs = nationsCheckboxPresenter.checkboxArgs(
      'nations',
      'nations[]',
      'professions.form.hint.scope.certainNations',
    );

    const templateArgs: ScopeTemplate = {
      coversUK,
      industriesCheckboxItems,
      nationsCheckboxArgs,
      captionText: ViewUtils.captionText(this.i18nService, profession),
      errors,
    };

    return res.render('admin/professions/scope', templateArgs);
  }
}

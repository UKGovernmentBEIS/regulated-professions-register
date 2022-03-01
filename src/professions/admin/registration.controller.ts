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
import { I18nService } from 'nestjs-i18n';
import { Response, Request } from 'express';

import { AuthenticationGuard } from '../../common/authentication.guard';

import { UserPermission } from '../../users/user-permission';

import { ProfessionsService } from '../professions.service';
import { ProfessionVersionsService } from '../profession-versions.service';

import { ProfessionVersion } from '../profession-version.entity';

import { Permissions } from '../../common/permissions.decorator';
import { BackLink } from '../../common/decorators/back-link.decorator';

import { ValidationFailedError } from '../../common/validation/validation-failed.error';

import { isConfirmed } from '../../helpers/is-confirmed';
import { Validator } from '../../helpers/validator';

import { RegistrationDto } from './dto/registration.dto';

import { MandatoryRegistrationRadioButtonsPresenter } from './mandatory-registration-radio-buttons-presenter';
import { RegistrationTemplate } from './interfaces/registration.template';

import ViewUtils from './viewUtils';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class RegistrationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/registration/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/scope/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: string,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      version,
      isConfirmed(profession),
      change === 'true',
    );
  }

  @Post('/:professionId/versions/:versionId/registration')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/scope/edit',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() registrationDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      RegistrationDto,
      registrationDto,
    );
    const submittedValues = validator.obj;

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const selectedMandatoryRegistration = submittedValues.mandatoryRegistration;

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        submittedValues,
        isConfirmed(profession),
        submittedValues.change,
        errors,
      );
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        registrationRequirements: submittedValues.registrationRequirements,
        registrationUrl: submittedValues.registrationUrl,
        mandatoryRegistration: selectedMandatoryRegistration,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    if (submittedValues.change) {
      return res.redirect(
        `/admin/professions/${version.profession.id}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${versionId}/regulated-activities/edit`,
    );
  }

  private async renderForm(
    res: Response,
    submittedValues: ProfessionVersion | RegistrationDto,
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const mandatoryRegistration = submittedValues.mandatoryRegistration;

    const mandatoryRegistrationRadioButtonArgs =
      await new MandatoryRegistrationRadioButtonsPresenter(
        mandatoryRegistration,
        this.i18nService,
      ).radioButtonArgs();

    const templateArgs: RegistrationTemplate = {
      ...submittedValues,
      mandatoryRegistrationRadioButtonArgs,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render('admin/professions/registration', templateArgs);
  }
}

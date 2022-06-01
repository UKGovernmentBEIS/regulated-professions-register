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
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

import { AuthenticationGuard } from '../../common/authentication.guard';

import { UserPermission } from '../../users/user-permission';

import { ProfessionsService } from '../professions.service';
import { ProfessionVersionsService } from '../profession-versions.service';

import { ProfessionVersion } from '../profession-version.entity';

import { Permissions } from '../../common/permissions.decorator';
import { BackLink } from '../../common/decorators/back-link.decorator';

import { ValidationFailedError } from '../../common/validation/validation-failed.error';

import { Validator } from '../../helpers/validator';

import { RegistrationDto } from './dto/registration.dto';

import { RegistrationTemplate } from './interfaces/registration.template';

import ViewUtils from './viewUtils';
import { Profession } from '../profession.entity';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';

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
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanChangeProfession(req, profession);

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(res, version, profession);
  }

  @Post('/:professionId/versions/:versionId/registration')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() registrationDto,
    @Req() req: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );
    checkCanChangeProfession(req, profession);

    const validator = await Validator.validate(
      RegistrationDto,
      registrationDto,
    );
    const submittedValues = validator.obj;

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(res, submittedValues, profession, errors);
    }

    const updatedVersion: ProfessionVersion = {
      ...version,
      ...{
        registrationRequirements: submittedValues.registrationRequirements,
        registrationUrl: submittedValues.registrationUrl,
      },
    };

    await this.professionVersionsService.save(updatedVersion);

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${versionId}/check-your-answers`,
    );
  }

  private renderForm(
    res: Response,
    submittedValues: ProfessionVersion | RegistrationDto,
    profession: Profession,
    errors: object | undefined = undefined,
  ): void {
    const templateArgs: RegistrationTemplate = {
      ...submittedValues,
      captionText: ViewUtils.captionText(this.i18nService, profession),
      errors,
    };

    return res.render('admin/professions/registration', templateArgs);
  }
}

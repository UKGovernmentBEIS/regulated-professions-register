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
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { Validator } from '../../helpers/validator';
import { Qualification } from '../../qualifications/qualification.entity';
import { UserPermission } from '../../users/user-permission';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { ProfessionsService } from '../professions.service';
import { YesNoRadioButtonArgsPresenter } from './yes-no-radio-buttons-presenter';
import { QualificationsDto } from './dto/qualifications.dto';
import { QualificationsTemplate } from './interfaces/qualifications.template';
import { BackLink } from '../../common/decorators/back-link.decorator';
import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isConfirmed } from '../../helpers/is-confirmed';
import { isUK } from '../../helpers/nations.helper';
import { ProfessionVersion } from '../profession-version.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class QualificationsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/qualifications/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/regulated-activities/edit',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('change') change: boolean,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      version.qualification,
      version,
      isConfirmed(profession),
      change,
    );
  }

  @Post('/:professionId/versions/:versionId/qualifications')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/professions/:professionId/versions/:versionId/check-your-answers'
      : '/admin/professions/:professionId/versions/:versionId/regulated-activities/edit',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() qualificationsDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      QualificationsDto,
      qualificationsDto,
    );

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const submittedValues: QualificationsDto = qualificationsDto;

    const mandatoryProfessionalExperience =
      submittedValues.mandatoryProfessionalExperience === undefined
        ? undefined
        : Boolean(Number(submittedValues.mandatoryProfessionalExperience));

    const updatedQualification: Qualification = {
      ...version.qualification,
      ...{
        level: submittedValues.level,
        routesToObtain: submittedValues.routesToObtain,
        mostCommonRouteToObtain: submittedValues.mostCommonRouteToObtain,
        educationDuration: submittedValues.duration,
        mandatoryProfessionalExperience,
        url: submittedValues.moreInformationUrl,
        ukRecognition: submittedValues.ukRecognition,
        ukRecognitionUrl: submittedValues.ukRecognitionUrl,
        otherCountriesRecognition: submittedValues.otherCountriesRecognition,
        otherCountriesRecognitionUrl:
          submittedValues.otherCountriesRecognitionUrl,
      },
    };

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        updatedQualification,
        version,
        isConfirmed(profession),
        submittedValues.change,
        errors,
      );
    }

    version.qualification = updatedQualification;

    await this.professionVersionsService.save(version);

    if (submittedValues.change) {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
      );
    }

    return res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/legislation/edit`,
    );
  }

  private async renderForm(
    res: Response,
    qualification: Qualification | null,
    version: ProfessionVersion | null,
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ) {
    const mandatoryProfessionalExperienceRadioButtonArgs =
      await new YesNoRadioButtonArgsPresenter(
        qualification?.mandatoryProfessionalExperience,
        this.i18nService,
      ).radioButtonArgs();

    const templateArgs: QualificationsTemplate = {
      level: qualification?.level,
      routesToObtain: qualification?.routesToObtain,
      mostCommonRouteToObtain: qualification?.mostCommonRouteToObtain,
      mandatoryProfessionalExperienceRadioButtonArgs,
      moreInformationUrl: qualification?.url,
      duration: qualification?.educationDuration,
      captionText: ViewUtils.captionText(isEditing),
      ukRecognition: qualification?.ukRecognition,
      ukRecognitionUrl: qualification?.ukRecognitionUrl,
      otherCountriesRecognition: qualification?.otherCountriesRecognition,
      otherCountriesRecognitionUrl: qualification?.otherCountriesRecognitionUrl,
      isUK: isUK(version.occupationLocations || []),
      change,
      errors,
    };

    return res.render('admin/professions/qualifications', templateArgs);
  }
}

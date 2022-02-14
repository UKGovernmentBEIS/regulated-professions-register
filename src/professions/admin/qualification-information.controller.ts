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
import { MethodToObtainQualificationRadioButtonsPresenter } from './method-to-obtain-qualification-radio-buttons.presenter';
import { YesNoRadioButtonArgsPresenter } from './yes-no-radio-buttons-presenter';
import { QualificationInformationDto } from './dto/qualification-information.dto';
import { QualificationInformationTemplate } from './interfaces/qualification-information.template';
import { BackLink } from '../../common/decorators/back-link.decorator';
import ViewUtils from './viewUtils';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isConfirmed } from '../../helpers/is-confirmed';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class QualificationInformationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/qualification-information/edit')
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
      isConfirmed(profession),
      change,
    );
  }

  @Post('/:professionId/versions/:versionId/qualification-information')
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
    @Body() qualificationInformationDto,
  ): Promise<void> {
    const validator = await Validator.validate(
      QualificationInformationDto,
      qualificationInformationDto,
    );

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const submittedValues: QualificationInformationDto =
      qualificationInformationDto;

    const mandatoryProfessionalExperience =
      submittedValues.mandatoryProfessionalExperience === undefined
        ? undefined
        : Boolean(Number(submittedValues.mandatoryProfessionalExperience));

    const updatedQualification: Qualification = {
      ...version.qualification,
      ...{
        level: submittedValues.level,
        methodToObtain: submittedValues.methodToObtainQualification,
        otherMethodToObtain: submittedValues.otherMethodToObtainQualification,
        commonPathToObtain: submittedValues.mostCommonPathToObtainQualification,
        otherCommonPathToObtain:
          submittedValues.otherMostCommonPathToObtainQualification,
        educationDuration: submittedValues.duration,
        mandatoryProfessionalExperience,
      },
    };

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        updatedQualification,
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
    isEditing: boolean,
    change: boolean,
    errors: object | undefined = undefined,
  ) {
    const mostCommonPathToObtainQualificationRadioButtonArgs =
      await new MethodToObtainQualificationRadioButtonsPresenter(
        qualification?.commonPathToObtain,
        qualification?.otherCommonPathToObtain,
        errors,
        this.i18nService,
      ).radioButtonArgs('mostCommonPathToObtainQualification');

    const methodToObtainQualificationRadioButtonArgs =
      await new MethodToObtainQualificationRadioButtonsPresenter(
        qualification?.methodToObtain,
        qualification?.otherMethodToObtain,
        errors,
        this.i18nService,
      ).radioButtonArgs('methodToObtainQualification');

    const mandatoryProfessionalExperienceRadioButtonArgs =
      await new YesNoRadioButtonArgsPresenter(
        qualification?.mandatoryProfessionalExperience,
        this.i18nService,
      ).radioButtonArgs();

    const templateArgs: QualificationInformationTemplate = {
      level: qualification?.level,
      methodToObtainQualificationRadioButtonArgs,
      mostCommonPathToObtainQualificationRadioButtonArgs,
      mandatoryProfessionalExperienceRadioButtonArgs,
      duration: qualification?.educationDuration,
      captionText: ViewUtils.captionText(isEditing),
      change,
      errors,
    };

    return res.render(
      'admin/professions/qualification-information',
      templateArgs,
    );
  }
}

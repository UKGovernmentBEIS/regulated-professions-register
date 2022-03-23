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
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { Validator } from '../../helpers/validator';
import { Legislation } from '../../legislations/legislation.entity';
import { UserPermission } from '../../users/user-permission';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { ProfessionsService } from '../professions.service';
import LegislationDto from './dto/legislation.dto';
import { LegislationTemplate } from './interfaces/legislation.template';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { I18nService } from 'nestjs-i18n';
import { Profession } from '../profession.entity';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class LegislationController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/:versionId/legislation/edit')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async edit(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanViewProfession(request, profession);

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    return this.renderForm(
      res,
      version.legislations[0],
      version.legislations[1],
      profession,
    );
  }

  @Post('/:professionId/versions/:versionId/legislation')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @BackLink(
    '/admin/professions/:professionId/versions/:versionId/check-your-answers',
  )
  async update(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Body() legislationDto,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    checkCanViewProfession(request, profession);

    const validator = await Validator.validate(LegislationDto, legislationDto);
    const submittedValues = validator.obj;

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    const updatedLegislation: Legislation = {
      ...version.legislations[0],
      ...{
        name: submittedValues.nationalLegislation,
        url: submittedValues.link,
      },
    };

    const updatedSecondLegislation: Legislation = {
      ...version.legislations[1],
      ...{
        name: submittedValues.secondNationalLegislation,
        url: submittedValues.secondLink,
      },
    };

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();

      return this.renderForm(
        res,
        updatedLegislation,
        updatedSecondLegislation,
        profession,
        errors,
      );
    }

    const updatedLegislations = [updatedLegislation];

    if (updatedSecondLegislation.name || updatedSecondLegislation.url) {
      updatedLegislations.push(updatedSecondLegislation);
    }

    version.legislations = updatedLegislations;

    await this.professionVersionsService.save(version);

    res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/check-your-answers`,
    );
  }

  private async renderForm(
    res: Response,
    legislation: Legislation,
    secondLegislation: Legislation,
    profession: Profession,
    errors: object | undefined = undefined,
  ): Promise<void> {
    const templateArgs: LegislationTemplate = {
      legislation,
      secondLegislation,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      errors,
    };

    return res.render('admin/professions/legislation', templateArgs);
  }
}

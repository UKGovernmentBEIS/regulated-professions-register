import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { getReferrer } from '../../common/utils';

import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { CheckYourAnswersTemplate } from './interfaces/check-your-answers.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isConfirmed } from '../../helpers/is-confirmed';
import { isUK } from '../../helpers/nations.helper';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class CheckYourAnswersController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':professionId/versions/:versionId/check-your-answers')
  @Permissions(UserPermission.CreateProfession, UserPermission.EditProfession)
  @Render('admin/professions/check-your-answers')
  @BackLink((request: Request) => getReferrer(request))
  async show(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('edit') edit: string,
  ): Promise<CheckYourAnswersTemplate> {
    const draftProfession = await this.professionsService.findWithVersions(
      professionId,
    );

    if (!draftProfession) {
      throw new Error('Draft profession not found');
    }

    const version = await this.professionVersionsService.findWithProfession(
      versionId,
    );

    if (!version) {
      throw new Error('Version not found');
    }

    const industryNames = await Promise.all(
      version.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    const selectedNations: string[] = await Promise.all(
      (version.occupationLocations || []).map(async (nationCode) =>
        Nation.find(nationCode).translatedName(this.i18nService),
      ),
    );

    const qualification = new QualificationPresenter(
      version.qualification,
      this.i18nService,
    );

    const legislations = [version.legislations[0], version.legislations[1]];

    return {
      professionId,
      versionId,
      name: draftProfession.name,
      nations: selectedNations,
      industries: industryNames,
      organisation: draftProfession.organisation.name,
      additionalOrganisation: draftProfession.additionalOrganisation
        ? draftProfession.additionalOrganisation.name
        : null,
      registrationRequirements: version.registrationRequirements,
      registrationUrl: version.registrationUrl,
      regulationSummary: version.description,
      reservedActivities: version.reservedActivities,
      protectedTitles: version.protectedTitles,
      regulationUrl: version.regulationUrl,
      qualification,
      legislations,
      confirmed: isConfirmed(draftProfession),
      captionText: await ViewUtils.captionText(
        this.i18nService,
        draftProfession,
      ),
      isUK: version.occupationLocations
        ? isUK(version.occupationLocations)
        : false,
      edit: edit === 'true',
    };
  }
}

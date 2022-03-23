import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { getReferrer } from '../../common/utils';

import { Nation } from '../../nations/nation';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { CheckYourAnswersTemplate } from './interfaces/check-your-answers.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isUK } from '../../helpers/nations.helper';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';
import { getPublicationBlockers } from '../helpers/get-publication-blockers.helper';
import { Profession } from '../profession.entity';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class CheckYourAnswersController {
  constructor(
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
    @Req() request: RequestWithAppSession,
  ): Promise<CheckYourAnswersTemplate> {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    const profession = Profession.withVersion(version.profession, version);

    if (!version) {
      throw new Error('Version not found');
    }

    checkCanViewProfession(request, profession);

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

    return {
      professionId,
      versionId,
      name: profession.name,
      nations: selectedNations,
      industries: industryNames,
      organisation: profession.organisation.name,
      additionalOrganisation: profession.additionalOrganisation
        ? profession.additionalOrganisation.name
        : null,
      registrationRequirements: version.registrationRequirements,
      registrationUrl: version.registrationUrl,
      regulationSummary: version.description,
      regulationType: version.regulationType,
      reservedActivities: version.reservedActivities,
      protectedTitles: version.protectedTitles,
      regulationUrl: version.regulationUrl,
      qualification,
      legislations: version.legislations,
      captionText: await ViewUtils.captionText(this.i18nService, profession),
      publicationBlockers: getPublicationBlockers(version),
      isUK: version.occupationLocations
        ? isUK(version.occupationLocations)
        : false,
      edit: edit === 'true',
    };
  }
}

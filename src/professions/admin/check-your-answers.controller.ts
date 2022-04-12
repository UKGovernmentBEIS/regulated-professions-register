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
import { ProfessionToOrganisationsPresenter } from './presenters/profession-to-organisations.presenter';
import { CheckYourAnswersTemplate } from './interfaces/check-your-answers.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import ViewUtils from './viewUtils';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isUK } from '../../helpers/nations.helper';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { getPublicationBlockers } from '../helpers/get-publication-blockers.helper';
import { Profession } from '../profession.entity';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';

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

    checkCanChangeProfession(request, profession);

    const industryNames = version.industries.map((industry) =>
      this.i18nService.translate<string>(industry.name),
    );

    const nations = new NationsListPresenter(
      (version.occupationLocations || []).map((code) => Nation.find(code)),
      this.i18nService,
    );

    const qualification = new QualificationPresenter(
      version.qualification,
      this.i18nService,
    );

    const organisations = await new ProfessionToOrganisationsPresenter(
      profession,
      version,
      this.i18nService,
      getActingUser(request),
    ).summaryLists();

    return {
      professionId,
      versionId,
      name: profession.name,
      nations: await nations.htmlList(),
      industries: industryNames,
      organisations: organisations,
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

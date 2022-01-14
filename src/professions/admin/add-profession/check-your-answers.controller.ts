import { Controller, Get, Param, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../../common/authentication.guard';
import { backLink } from '../../../common/utils';

import { Nation } from '../../../nations/nation';
import { ProfessionsService } from '../../professions.service';
import QualificationPresenter from '../../../qualifications/presenters/qualification.presenter';
import { CheckYourAnswersTemplate } from './interfaces/check-your-answers.template';
import { Permissions } from '../../../common/permissions.decorator';
import { UserPermission } from '../../../users/user.entity';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class CheckYourAnswersController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':id/check-your-answers')
  @Permissions(UserPermission.CreateProfession)
  @Render('admin/professions/add-profession/check-your-answers')
  async show(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<CheckYourAnswersTemplate> {
    const draftProfession = await this.professionsService.find(id);

    if (!draftProfession) {
      throw new Error('Draft profession not found');
    }

    const industryNames = await Promise.all(
      draftProfession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    const selectedNations: string[] = await Promise.all(
      draftProfession.occupationLocations.map(async (nationCode) =>
        Nation.find(nationCode).translatedName(this.i18nService),
      ),
    );

    return {
      professionId: id,
      name: draftProfession.name,
      nations: selectedNations,
      industries: industryNames,
      organisation: draftProfession.organisation.name,
      mandatoryRegistration: draftProfession.mandatoryRegistration,
      description: draftProfession.description,
      reservedActivities: draftProfession.reservedActivities,
      qualification: new QualificationPresenter(draftProfession.qualification),
      backLink: backLink(req),
    };
  }
}

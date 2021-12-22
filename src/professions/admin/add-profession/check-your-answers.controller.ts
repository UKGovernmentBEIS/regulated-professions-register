import { Controller, Get, Param, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { Nation } from '../../../nations/nation';
import { ProfessionsService } from '../../professions.service';
import { CheckYourAnswersTemplate } from './interfaces/check-your-answers.template';

@Controller('admin/professions')
export class CheckYourAnswersController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':id/check-your-answers')
  @Render('professions/admin/add-profession/check-your-answers')
  async show(@Param('id') id: string): Promise<CheckYourAnswersTemplate> {
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
    };
  }
}

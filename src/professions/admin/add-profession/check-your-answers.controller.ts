import { Controller, Get, Render, Session } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { Nation } from '../../../nations/nation';
import { ProfessionsService } from '../../professions.service';

@Controller('admin/professions/new/check-your-answers')
export class CheckYourAnswersController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('professions/admin/add-profession/check-your-answers')
  async show(@Session() session: Record<string, any>): Promise<{
    name: string;
    nations: string[];
    industries: string[];
  }> {
    const professionId = session['profession-id'];

    const draftProfession = await this.professionsService.find(professionId);

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
      name: draftProfession.name,
      nations: selectedNations,
      industries: industryNames,
    };
  }
}

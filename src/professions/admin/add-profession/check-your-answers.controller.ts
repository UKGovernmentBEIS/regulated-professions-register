import { Controller, Get, Render, Session } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';

@Controller('admin/professions/new/check-your-answers')
export class CheckYourAnswersController {
  constructor(
    private industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('professions/admin/add-profession/check-your-answers')
  async show(@Session() session: Record<string, any>): Promise<{
    name: string;
    nations: string[];
    industry: string;
  }> {
    const addProfessionSession = session['add-profession'];
    const topLevelDetails: TopLevelDetailsDto =
      addProfessionSession['top-level-details'];

    const selectedIndustry = await this.industriesService.find(
      topLevelDetails.industryId,
    );

    const selectedNations: string[] = await Promise.all(
      topLevelDetails.nations.map(async (nationCode) => {
        const nationKey = Nation.find(nationCode).name;

        return await this.i18nService.translate(nationKey);
      }),
    );
    return {
      name: topLevelDetails.name,
      nations: selectedNations,
      industry: selectedIndustry.name,
    };
  }
}

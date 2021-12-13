import { Controller, Get, Render, Session } from '@nestjs/common';

import { IndustriesService } from '../../../industries/industries.service';
import { Nation } from '../../../nations/nation';
import { TopLevelDetailsDto } from './dto/top-level-details.dto';

@Controller('admin/professions/new/check-your-answers')
export class CheckYourAnswersController {
  constructor(private industriesService: IndustriesService) {}

  @Get()
  @Render('professions/admin/add-profession/check-your-answers')
  async show(@Session() session: Record<string, any>): Promise<{
    name: string;
    nation: string;
    industry: string;
  }> {
    const addProfessionSession = session['add-profession'];
    const topLevelDetails: TopLevelDetailsDto =
      addProfessionSession['top-level-details'];

    const selectedIndustry = await this.industriesService.find(
      topLevelDetails.industryId,
    );

    const selectedNation = Nation.find(topLevelDetails.nation);

    return {
      name: topLevelDetails.name,
      nation: selectedNation.name,
      industry: selectedIndustry.name,
    };
  }
}

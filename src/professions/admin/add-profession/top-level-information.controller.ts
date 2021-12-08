import { Controller, Get, Render } from '@nestjs/common';
import { IndustriesService } from '../../../industries/industries.service';

@Controller('admin/professions/add-profession/top-level-information')
export class TopLevelInformationController {
  constructor(private industriesService: IndustriesService) {}

  @Get()
  @Render('professions/admin/add-profession/top-level-information')
  async new(): Promise<{
    industriesOptionSelectArgs: { text: string; value: string }[];
  }> {
    const industries = await this.industriesService.all();

    const industriesOptionSelectArgs = industries.map((industry) => ({
      text: industry.name,
      value: industry.id,
    }));

    return { industriesOptionSelectArgs };
  }
}

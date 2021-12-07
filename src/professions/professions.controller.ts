import { Controller, Get, Param, Render } from '@nestjs/common';
import { ProfessionsService } from './professions.service';

@Controller()
export class ProfessionsController {
  constructor(private professionsService: ProfessionsService) {}

  @Get('professions/:slug/:id')
  @Render('professions/read')
  async show(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ): Promise<ShowTemplate> {

    const profession = await this.professionsService.find(id);

    if (!profession) {
      throw new Error(`A profession with ID ${id} could not be found`);
    }

    return { professionName: profession.name };
  }
}

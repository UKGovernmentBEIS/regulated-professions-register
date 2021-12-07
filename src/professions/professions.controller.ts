import { Controller, Get, NotFoundException, Param, Render } from '@nestjs/common';
import { ProfessionsService } from './professions.service';

@Controller()
export class ProfessionsController {
  constructor(private professionsService: ProfessionsService) {}

  @Get('professions/:id')
  @Render('professions/show')
  async show(
    @Param('id') id: string,
  ): Promise<ShowTemplate> {

    const profession = await this.professionsService.find(id);

    if (!profession) {
      throw new NotFoundException(`A profession with ID ${id} could not be found`);
    }

    return { professionName: profession.name };
  }
}

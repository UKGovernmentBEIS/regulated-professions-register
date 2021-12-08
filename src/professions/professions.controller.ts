import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ProfessionsController {
  @Get('admin/professions/add-profession')
  @Render('professions/admin/add-profession/new')
  new(): Record<string, any> {
    return {};
  }
}

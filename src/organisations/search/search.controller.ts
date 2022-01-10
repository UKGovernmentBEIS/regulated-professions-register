import { Controller, Get, Render } from '@nestjs/common';

import { IndexTemplate } from './interfaces/index-template.interface';

@Controller('regulatory-authorities/search')
export class SearchController {
  @Get()
  @Render('organisations/search/index')
  async index(): Promise<IndexTemplate> {
    return { backLink: '/select-service' };
  }
}

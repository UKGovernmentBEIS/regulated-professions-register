import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { backLink } from '../../common/utils';

import { IndexTemplate } from './interfaces/index-template.interface';

@Controller('regulatory-authorities/search')
export class SearchController {
  @Get()
  @Render('organisations/search/index')
  async index(@Req() request: Request): Promise<IndexTemplate> {
    return { backLink: backLink(request) };
  }
}

import { Query, Controller, Get, Render, Req } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { OrganisationVersionsService } from '../organisation-versions.service';

import { FilterDto } from './dto/filter.dto';

import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchPresenter } from './search.presenter';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { createFilterInput } from '../../helpers/create-filter-input.helper';

@Controller('regulatory-authorities/search')
export class SearchController {
  constructor(
    private readonly organisationVersionsService: OrganisationVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('organisations/search/index')
  @BackLink('/')
  async index(
    @Query() filter: FilterDto,
    @Req() request: Request,
  ): Promise<IndexTemplate> {
    request.session.searchResultUrl = request.url;

    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();

    const filterInput = createFilterInput({
      ...filter,
      allNations,
      allIndustries,
    });

    const filteredOrganisations =
      await this.organisationVersionsService.searchLive(filterInput);

    return new SearchPresenter(
      filterInput,
      allNations,
      allIndustries,
      filteredOrganisations,
      this.i18nService,
    ).present();
  }
}

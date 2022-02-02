import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
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
  async index(): Promise<IndexTemplate> {
    return this.createSearchResults(new FilterDto());
  }

  @Post()
  @Render('organisations/search/index')
  @BackLink('/')
  async create(@Body() filter: FilterDto): Promise<IndexTemplate> {
    return this.createSearchResults(filter);
  }

  private async createSearchResults(filter: FilterDto): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();

    const allOrganisations = await this.organisationVersionsService.allLive();

    const filterInput = createFilterInput({
      ...filter,
      allNations,
      allIndustries,
    });

    const filteredOrganisations = new OrganisationsFilterHelper(
      allOrganisations,
    ).filter(filterInput);

    return new SearchPresenter(
      filterInput,
      allNations,
      allIndustries,
      filteredOrganisations,
      this.i18nService,
    ).present();
  }
}

import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IndustriesService } from '../../industries/industries.service';
import { Industry } from '../../industries/industry.entity';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { Nation } from '../../nations/nation';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import { OrganisationsService } from '../organisations.service';
import { FilterDto } from './dto/filter.dto';

import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchPresenter } from './search.presenter';
import { BackLink } from '../../common/decorators/back-link.decorator';

@Controller('regulatory-authorities/search')
export class SearchController {
  constructor(
    private readonly organisationsService: OrganisationsService,
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

    const allOrganisations =
      await this.organisationsService.allWithProfessions();

    const filterInput = this.getFilterInput(filter, allNations, allIndustries);

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

  private getFilterInput(
    filter: FilterDto,
    allNations: Nation[],
    allIndustries: Industry[],
  ): FilterInput {
    const nations = allNations.filter((nation) =>
      filter.nations.includes(nation.code),
    );
    const industries = allIndustries.filter((industry) =>
      filter.industries.includes(industry.id),
    );

    return { nations, industries, keywords: filter.keywords };
  }
}

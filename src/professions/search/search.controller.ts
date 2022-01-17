import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import { FilterDto } from './dto/filter.dto';
import { FilterHelper } from '../helpers/filter.helper';
import { FilterInput } from '../interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchPresenter } from './search.presenter';

@Controller('professions/search')
export class SearchController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('professions/search/index')
  async index(): Promise<IndexTemplate> {
    return this.createSearchResults(new FilterDto());
  }

  @Post()
  @Render('professions/search/index')
  async create(@Body() filter: FilterDto): Promise<IndexTemplate> {
    return this.createSearchResults(filter);
  }

  private async createSearchResults(filter: FilterDto): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();

    const allProfessions = await this.professionsService.allConfirmed();

    const filterInput = this.getFilterInput(filter, allNations, allIndustries);

    const filteredProfessions = new FilterHelper(allProfessions).filter(
      filterInput,
    );

    return new SearchPresenter(
      filterInput,
      allNations,
      allIndustries,
      filteredProfessions,
      this.i18nService,
      '/select-service',
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

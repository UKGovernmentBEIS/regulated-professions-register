import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import { FilterDto } from './dto/filter.dto';
import { FilterHelper } from './helpers/filter.helper';
import { FilterInput } from './interfaces/filter-input.interface';
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
  async index(@Req() request: Request): Promise<IndexTemplate> {
    return this.createSearchResults(new FilterDto(), request);
  }

  @Post()
  @Render('professions/search/index')
  async create(
    @Body() filter: FilterDto,
    @Req() request: Request,
  ): Promise<IndexTemplate> {
    return this.createSearchResults(filter, request);
  }

  private async createSearchResults(
    filter: FilterDto,
    request: Request,
  ): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();
    const allProfessions = await this.professionsService.all();

    const filterInput = this.getFilterInput(filter, allNations, allIndustries);

    const filteredProfessions = new FilterHelper(allProfessions).filter(
      filterInput,
    );

    return new SearchPresenter(
      filterInput,
      allNations,
      allIndustries,
      filteredProfessions,
    ).present(this.i18nService, request);
  }

  private getFilterInput(
    filter: FilterDto,
    allNations: Nation[],
    allIndustries: Industry[],
  ): FilterInput {
    // Where a single option is selected, NestJS gives us a string rather than
    // a single element array
    const filterIndustryIds =
      typeof filter.industries === 'string'
        ? [filter.industries]
        : filter.industries;
    const filterNationCodes =
      typeof filter.nations === 'string' ? [filter.nations] : filter.nations;

    const nations = allNations.filter((nation) =>
      filterNationCodes.includes(nation.code),
    );
    const industries = allIndustries.filter((industry) =>
      filterIndustryIds.includes(industry.id),
    );

    return { nations, industries, keywords: filter.keywords };
  }
}

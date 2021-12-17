import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { backLink } from '../../common/utils';
import { Industry } from '../../industries/industry.entity';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { FilterDto } from './dto/filter.dto';
import { FilterHelper } from './helpers/filter.helper';
import { FilterInput } from './interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';

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
    return {
      ...(await this.createSearchResults(new FilterDto())),
      backLink: backLink(request),
    };
  }

  @Post()
  @Render('professions/search/index')
  async create(
    @Body() filter: FilterDto,
    @Req() request: Request,
  ): Promise<IndexTemplate> {
    return {
      ...(await this.createSearchResults(filter)),
      backLink: backLink(request),
    };
  }

  private async createSearchResults(
    filter: FilterDto,
  ): Promise<Omit<IndexTemplate, 'backLink'>> {
    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();
    const allProfessions = await this.professionsService.all();

    const filterInput = this.getFilterInput(filter, allNations, allIndustries);

    const filterProfessions = new FilterHelper(allProfessions).filter(
      filterInput,
    );

    return this.presentResults(
      filterInput,
      allNations,
      allIndustries,
      filterProfessions,
    );
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

  private async presentResults(
    filterInput: FilterInput,
    allNations: Nation[],
    allIndustries: Industry[],
    filteredProfessions: Profession[],
  ): Promise<Omit<IndexTemplate, 'backLink'>> {
    const nationsOptionSelectArgs = allNations.map((nation) => ({
      text: nation.name,
      value: nation.code,
      checked: filterInput.nations.includes(nation),
    }));

    const industriesOptionSelectArgs = allIndustries.map((industry) => ({
      text: industry.name,
      value: industry.id,
      checked: filterInput.industries.includes(industry),
    }));

    const displayProfessions = await Promise.all(
      filteredProfessions.map(async (profession) => {
        const nations = await Promise.all(
          profession.occupationLocations.map(async (code) =>
            Nation.find(code).translatedName(this.i18nService),
          ),
        );

        const industries = await Promise.all(
          profession.industries.map(
            async (industry) => await this.i18nService.translate(industry.name),
          ),
        );

        return { ...profession, nations, industries };
      }),
    );

    return {
      professions: displayProfessions,
      nationsOptionSelectArgs,
      industriesOptionSelectArgs,
      filters: {
        keywords: filterInput.keywords,
        nations: filterInput.nations.map((nation) => nation.name),
        industries: filterInput.industries.map((industry) => industry.name),
      },
    };
  }
}

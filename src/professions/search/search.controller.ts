import { Body, Controller, Get, Post, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { backLink } from '../../common/utils';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { ProfessionsService } from '../professions.service';
import { FilterDto } from './dto/filter.dto';
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
    // Where a single option is selected, NestJS gives us a string rather than
    // a single element array
    if (typeof filter.industries === 'string') {
      filter.industries = [filter.industries];
    }

    if (typeof filter.nations === 'string') {
      filter.nations = [filter.nations];
    }

    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();

    const allProfessions = await this.professionsService.allConfirmed();

    const filterNations = Nation.all().filter((nation) =>
      filter.nations.includes(nation.code),
    );
    const filterIndustries = allIndustries.filter((industry) =>
      filter.industries.includes(industry.id),
    );

    const nationsOptionSelectArgs = allNations.map((nation) => ({
      text: nation.name,
      value: nation.code,
      checked: filterNations.includes(nation),
    }));

    const industriesOptionSelectArgs = allIndustries.map((industry) => ({
      text: industry.name,
      value: industry.id,
      checked: filterIndustries.includes(industry),
    }));

    const displayProfessions = await Promise.all(
      allProfessions.map(async (profession) => {
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
        keywords: filter.keywords,
        nations: filterNations.map((nation) => nation.name),
        industries: filterIndustries.map((industry) => industry.name),
      },
    };
  }
}

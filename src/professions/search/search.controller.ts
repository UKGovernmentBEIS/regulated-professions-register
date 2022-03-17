import { Controller, Get, Query, Render } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { FilterDto } from './dto/filter.dto';
import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchPresenter } from './search.presenter';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { createFilterInput } from '../../helpers/create-filter-input.helper';
import { ProfessionVersionsService } from '../profession-versions.service';

@Controller('professions/search')
export class SearchController {
  constructor(
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly industriesService: IndustriesService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Render('professions/search/index')
  @BackLink('/')
  async index(@Query() filter: FilterDto): Promise<IndexTemplate> {
    const allNations = Nation.all();
    const allIndustries = await this.industriesService.all();

    const filterInput = createFilterInput({
      ...filter,
      allNations,
      allIndustries,
    });

    const filteredProfessions = await this.professionVersionsService.searchLive(
      filterInput,
    );

    return new SearchPresenter(
      filterInput,
      allNations,
      allIndustries,
      filteredProfessions,
      this.i18nService,
    ).present();
  }
}

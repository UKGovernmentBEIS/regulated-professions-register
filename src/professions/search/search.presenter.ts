import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { backLink } from '../../common/utils';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { Profession } from '../profession.entity';
import { FilterInput } from './interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';

export class SearchPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly allNations: Nation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
    private readonly i18nService: I18nService,
    private readonly request: Request,
  ) {}

  async present(): Promise<IndexTemplate> {
    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations,
      this.i18nService,
    ).checkboxArgs();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries,
      this.i18nService,
    ).checkboxArgs();

    const displayProfessions = await Promise.all(
      this.filteredProfessions.map(async (profession) =>
        new ProfessionSearchResultPresenter(
          profession,
          this.i18nService,
        ).present(),
      ),
    );

    displayProfessions.sort((profession1, profession2) => {
      if (profession1.name < profession2.name) {
        return -1;
      } else if (profession1.name > profession2.name) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      professions: displayProfessions,
      nationsCheckboxArgs,
      industriesCheckboxArgs,
      filters: {
        keywords: this.filterInput.keywords,
        nations: this.filterInput.nations.map((nation) => nation.name),
        industries: this.filterInput.industries.map(
          (industry) => industry.name,
        ),
      },
      backLink: backLink(this.request),
    };
  }
}

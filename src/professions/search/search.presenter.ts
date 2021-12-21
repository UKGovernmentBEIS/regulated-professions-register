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

export class SearchPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly allNations: Nation[],
    private readonly allIndustries: Industry[],
    private readonly filteredProfessions: Profession[],
  ) {}

  async present(
    i18nService: I18nService,
    request: Request,
  ): Promise<IndexTemplate> {
    const nationsCheckboxArgs = await new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations,
      i18nService,
    ).checkboxArgs();

    const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries,
      i18nService,
    ).checkboxArgs();

    const displayProfessions = await Promise.all(
      this.filteredProfessions.map(async (profession) => {
        const nations = await Promise.all(
          profession.occupationLocations.map(async (code) =>
            Nation.find(code).translatedName(i18nService),
          ),
        );

        const industries = await Promise.all(
          profession.industries.map(
            async (industry) => await i18nService.translate(industry.name),
          ),
        );

        return { ...profession, nations, industries };
      }),
    );

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
      backLink: backLink(request),
    };
  }
}

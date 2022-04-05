import { I18nService } from 'nestjs-i18n';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationSearchResultPresenter } from './organisation-search-result.presenter';
import { Organisation } from '../organisation.entity';
import { hasSelectedFilters } from '../../search/helpers/has-selected-filters.helper';
import { RegulationTypesCheckboxPresenter } from '../../professions/admin/presenters/regulation-types-checkbox.presenter';

export class SearchPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly allNations: Nation[],
    private readonly allIndustries: Industry[],
    private readonly filteredOrganisations: Organisation[],
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<IndexTemplate> {
    const nationsCheckboxItems = await new NationsCheckboxPresenter(
      this.allNations,
      this.filterInput.nations,
      this.i18nService,
    ).checkboxItems();

    const industriesCheckboxItems = await new IndustriesCheckboxPresenter(
      this.allIndustries,
      this.filterInput.industries,
      this.i18nService,
    ).checkboxItems();

    const regulationTypesCheckboxItems =
      await new RegulationTypesCheckboxPresenter(
        this.filterInput.regulationTypes,
        this.i18nService,
      ).checkboxItems();

    const displayOrganisations = await Promise.all(
      this.filteredOrganisations.map(async (organisation) => {
        return new OrganisationSearchResultPresenter(
          organisation,
          this.i18nService,
        ).present();
      }),
    );

    return {
      organisations: displayOrganisations,
      nationsCheckboxItems,
      industriesCheckboxItems,
      regulationTypesCheckboxItems,
      filters: {
        keywords: this.filterInput.keywords,
        nations: this.filterInput.nations.map((nation) => nation.name),
        industries: this.filterInput.industries.map(
          (industry) => industry.name,
        ),
        regulationTypes: this.filterInput.regulationTypes,
      },
      hasSelectedFilters: hasSelectedFilters(this.filterInput),
    };
  }
}

import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { backLink } from '../../common/utils';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationSearchResultPresenter } from './organisation-search-result.presenter';
import { OrganisationsSorter } from '../helpers/organisations-sorter';
import { Organisation } from '../organisation.entity';

export class SearchPresenter {
  constructor(
    private readonly filterInput: FilterInput,
    private readonly allNations: Nation[],
    private readonly allIndustries: Industry[],
    private readonly filteredOrganisations: Organisation[],
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

    const sortedProfessions = new OrganisationsSorter(
      this.filteredOrganisations,
    ).sortByName();

    const displayOrganisations = await Promise.all(
      sortedProfessions.map(async (organisation) =>
        new OrganisationSearchResultPresenter(organisation).present(),
      ),
    );

    return {
      organisations: displayOrganisations,
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

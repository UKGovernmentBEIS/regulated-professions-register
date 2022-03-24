import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { OrganisationSearchResultTemplate } from './organisation-search-result-template.interface';

export interface IndexTemplate {
  organisations: OrganisationSearchResultTemplate[];

  filters: {
    keywords: string;
    nations: string[];
    industries: string[];
    regulationTypes: string[];
  };

  nationsCheckboxItems: CheckboxItems[];

  industriesCheckboxItems: CheckboxItems[];

  regulationTypesCheckboxItems: CheckboxItems[];

  hasSelectedFilters: boolean;
}

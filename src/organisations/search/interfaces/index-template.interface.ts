import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { OrganisationSearchResultTemplate } from './organisation-search-result-template.interface';

export interface IndexTemplate {
  organisations: OrganisationSearchResultTemplate[];

  filters: {
    industries: string[];
    nations: string[];
    keywords: string;
  };

  nationsCheckboxItems: CheckboxItems[];

  industriesCheckboxItems: CheckboxItems[];

  hasSelectedFilters: boolean;
}

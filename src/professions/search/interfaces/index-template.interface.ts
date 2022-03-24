import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { ProfessionSearchResultTemplate } from './profession-search-result-template.interface';

export interface IndexTemplate {
  professions: ProfessionSearchResultTemplate[];

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

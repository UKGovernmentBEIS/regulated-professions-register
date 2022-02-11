import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { ProfessionSearchResultTemplate } from './profession-search-result-template.interface';

export interface IndexTemplate {
  professions: ProfessionSearchResultTemplate[];

  filters: {
    industries: string[];
    nations: string[];
    keywords: string;
  };

  nationsCheckboxItems: CheckboxItems[];

  industriesCheckboxItems: CheckboxItems[];
}

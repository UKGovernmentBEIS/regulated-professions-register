import { CheckboxArgs } from 'src/common/interfaces/checkbox-args.interface';
import { ProfessionSearchResultTemplate } from './profession-search-result-template.interface';

export interface IndexTemplate {
  professions: ProfessionSearchResultTemplate[];

  filters: {
    industries: string[];
    nations: string[];
    keywords: string;
  };

  nationsCheckboxArgs: CheckboxArgs[];

  industriesCheckboxArgs: CheckboxArgs[];

  backLink: string;
}

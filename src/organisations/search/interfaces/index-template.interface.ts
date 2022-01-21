import { CheckboxArgs } from 'src/common/interfaces/checkbox-args.interface';
import { OrganisationSearchResultTemplate } from './organisation-search-result-template.interface';

export interface IndexTemplate {
  organisations: OrganisationSearchResultTemplate[];

  filters: {
    industries: string[];
    nations: string[];
    keywords: string;
  };

  nationsCheckboxArgs: CheckboxArgs[];

  industriesCheckboxArgs: CheckboxArgs[];
}

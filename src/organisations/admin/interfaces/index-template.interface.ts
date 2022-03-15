import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';
import { RegulationType } from '../../../professions/profession-version.entity';
import { OrganisationsPresenterView } from '../presenters/organisations.presenter';

export interface IndexTemplate {
  view: OrganisationsPresenterView;

  userOrganisation: string;
  organisationsTable: Table;

  filters: {
    keywords: string;
    nations: string[];
    industries: string[];
    regulationTypes: RegulationType[];
  };

  nationsCheckboxItems: CheckboxItems[];
  industriesCheckboxItems: CheckboxItems[];
  regulationTypesCheckboxItems: CheckboxItems[];
}

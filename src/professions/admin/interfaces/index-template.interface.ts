import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';
import { ProfessionsPresenterView } from '../professions.presenter';

export interface IndexTemplate {
  view: ProfessionsPresenterView;

  organisation: string;

  professionsTable: Table;

  filters: {
    keywords: string;
    nations: string[];
    organisations: string[];
    industries: string[];
    changedBy: string[];
  };

  nationsCheckboxItems: CheckboxItems[];
  organisationsCheckboxItems: CheckboxItems[];
  industriesCheckboxItems: CheckboxItems[];
  changedByCheckboxItems: CheckboxItems[];
}

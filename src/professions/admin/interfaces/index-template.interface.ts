import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { TableRow } from 'src/common/interfaces/table-row';
import { ProfessionsPresenterView } from '../professions.presenter';

export interface IndexTemplate {
  view: ProfessionsPresenterView;

  organisation: string;

  headings: TableRow;
  professions: TableRow[];

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

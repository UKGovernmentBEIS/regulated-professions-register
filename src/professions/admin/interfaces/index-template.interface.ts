import { CheckboxArgs } from 'src/common/interfaces/checkbox-args.interface';
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

  nationsCheckboxArgs: CheckboxArgs[];
  organisationsCheckboxArgs: CheckboxArgs[];
  industriesCheckboxArgs: CheckboxArgs[];
  changedByCheckboxArgs: CheckboxArgs[];

  backLink: string;
}

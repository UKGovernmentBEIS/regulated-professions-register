import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';
import { DecisionDatasetsPresenterView } from '../presenters/decision-datasets.presenter';

export interface IndexTemplate {
  view: DecisionDatasetsPresenterView;

  organisation: string;

  decisionDatasetsTable: Table;

  filters: {
    keywords: string;
    organisations: string[];
    years: number[];
    statuses: string[];
  };

  organisationsCheckboxItems: CheckboxItems[];
  yearsCheckboxItems: CheckboxItems[];
  statusesCheckboxItems: CheckboxItems[];

  filterQuery: string;
}

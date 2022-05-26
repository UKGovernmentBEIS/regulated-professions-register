import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';
import { Profession } from '../../../professions/profession.entity';
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
    professions: Profession[];
  };

  organisationsCheckboxItems: CheckboxItems[];
  yearsCheckboxItems: CheckboxItems[];
  statusesCheckboxItems: CheckboxItems[];
  professionsCheckboxItems: CheckboxItems[];
  filterQuery: string;
}

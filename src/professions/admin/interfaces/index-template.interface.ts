import { CheckboxItems } from 'src/common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';
import { RegulationType } from '../../profession-version.entity';
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
    regulationTypes: RegulationType[];
  };

  nationsCheckboxItems: CheckboxItems[];
  organisationsCheckboxItems: CheckboxItems[];
  industriesCheckboxItems: CheckboxItems[];
  regulationTypesCheckboxItems: CheckboxItems[];
}

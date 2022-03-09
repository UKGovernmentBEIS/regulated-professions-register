import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { Table } from '../../../common/interfaces/table';

export interface IndexTemplate {
  userOrganisation: string;
  organisationsTable: Table;

  filters: {
    keywords: string;
    industries: string[];
  };

  industriesCheckboxItems: CheckboxItems[];
}

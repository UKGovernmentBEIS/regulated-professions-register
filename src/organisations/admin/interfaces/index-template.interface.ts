import { CheckboxArgs } from '../../../common/interfaces/checkbox-args.interface';
import { Table } from '../../../common/interfaces/table';

export interface IndexTemplate {
  organisationsTable: Table;

  filters: {
    keywords: string;
    industries: string[];
  };

  industriesCheckboxArgs: CheckboxArgs[];
}

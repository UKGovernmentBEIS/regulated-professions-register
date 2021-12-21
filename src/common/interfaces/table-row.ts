import { TableColumn } from './table-column';

export interface TableRow {
  [index: number]: TableColumn;
}

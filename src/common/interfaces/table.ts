import { TableRow } from './table-row';

export interface Table {
  firstCellIsHeader?: boolean;
  head: TableRow;
  rows: TableRow[];
  caption?: string;
  captionClasses?: string;
}

import { TableRow } from './table-row';

export interface Table {
  classes?: string;
  firstCellIsHeader?: boolean;
  head: TableRow;
  rows: TableRow[];
  caption?: string;
  captionClasses?: string;
}

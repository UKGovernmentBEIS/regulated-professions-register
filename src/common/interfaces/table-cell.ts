export type TableCell =
  | { text: string; attributes?: { [key: string]: string } }
  | { html: string };

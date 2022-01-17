type SummaryListItem = {
  key: { text: string } | { html: string };
  value: { text: string } | { html: string };
};

export type SummaryList = {
  classes: string;
  rows: SummaryListItem[];
};

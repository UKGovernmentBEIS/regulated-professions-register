export type SummaryListActionItem = {
  href: string;
  text: string;
  visuallyHiddenText: string;
};

export type SummaryListItem = {
  key: { text: string } | { html: string };
  value: { text: string } | { html: string };
  actions?: { items: Array<SummaryListActionItem> };
};

export type SummaryList = {
  classes?: string;
  attributes?: any;
  rows: Array<SummaryListItem>;
};

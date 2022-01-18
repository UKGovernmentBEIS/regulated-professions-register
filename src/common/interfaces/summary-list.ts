type SummaryListActionItem = {
  href: string;
  text: string;
  visuallyHiddenText: string;
};

type SummaryListItem = {
  key: { text: string } | { html: string };
  value: { text: string } | { html: string };
  actions?: { items: Array<SummaryListActionItem> };
};

export type SummaryList = {
  classes: string;
  rows: Array<SummaryListItem>;
};

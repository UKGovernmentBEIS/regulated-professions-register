export interface IndexTemplate {
  professions: {
    name: string;
    nations: string[];
    industries: string[];
    qualification: {
      level: string;
    };
  }[];

  filters: {
    industries: string[];
    nations: string[];
    keywords: string;
  };

  nationsCheckboxArgs: {
    text: string;
    value: string;
    checked: boolean;
  }[];

  industriesCheckboxArgs: {
    text: string;
    value: string;
    checked: boolean;
  }[];

  backLink: string;
}

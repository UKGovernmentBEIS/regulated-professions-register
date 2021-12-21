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

  nationsOptionSelectArgs: {
    text: string;
    value: string;
    checked: boolean;
  }[];

  industriesOptionSelectArgs: {
    text: string;
    value: string;
    checked: boolean;
  }[];

  backLink: string;
}

export interface DecisionRoute {
  name: string;
  countries: {
    country: string;
    decisions: {
      yes: number | null;
      no: number | null;
      yesAfterComp: number | null;
      noAfterComp: number | null;
    };
  }[];
}

export interface DecisionRoute {
  name: string;
  countries: {
    country: string;
    decisions: {
      yes: number;
      no: number;
      yesAfterComp: number;
      noAfterComp: number;
    };
  }[];
}

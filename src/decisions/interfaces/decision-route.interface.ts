export interface DecisionRoute {
  name: string;
  countries: {
    code: string | null;
    decisions: {
      yes: number | null;
      no: number | null;
      yesAfterComp: number | null;
      noAfterComp: number | null;
    };
  }[];
}

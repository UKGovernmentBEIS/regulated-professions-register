export interface ShowTemplate {
  profession: string;
  nations: string;
  year: number;
  organisations: {
    organisation: string;
    routes: {
      route: string;
      yes: number;
      no: number;
      yesAfterComp: number;
      noAfterComp: number;
      total: number;
    }[];
  }[];
}

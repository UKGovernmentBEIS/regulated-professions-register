import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface RouteTemplate {
  name: string;
  countries: {
    countrySelectArgs: SelectItemArgs[];
    decisions: {
      yes: string;
      no: string;
      yesAfterComp: string;
      noAfterComp: string;
    };
  }[];
}

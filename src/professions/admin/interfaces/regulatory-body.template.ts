import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface RegulatoryBodyTemplate {
  regulatedAuthoritiesSelectArgs: SelectItemArgs[];
  additionalRegulatedAuthoritiesSelectArgs: SelectItemArgs[];
  change: boolean;
  captionText: string;
  errors: object | undefined;
}

import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface TopLevelDetailsTemplate {
  name: string | null;
  regulatedAuthoritiesSelectArgs: SelectItemArgs[];
  additionalRegulatedAuthoritiesSelectArgs: SelectItemArgs[];
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

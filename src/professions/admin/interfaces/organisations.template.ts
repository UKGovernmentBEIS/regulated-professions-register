import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface OrganisationsTemplate {
  regulatedAuthoritiesSelectArgs: SelectItemArgs[];
  additionalRegulatedAuthoritiesSelectArgs: SelectItemArgs[];
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

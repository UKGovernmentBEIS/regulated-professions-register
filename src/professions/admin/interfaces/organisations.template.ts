import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface OrganisationsTemplate {
  selectArgsArray: Array<SelectItemArgs[]>;
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

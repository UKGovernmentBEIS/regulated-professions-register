import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { ActionType } from '../../helpers/get-action-type-from-user';
export class EditTemplate {
  organisationsSelectArgs: SelectItemArgs[];
  serviceOwnerRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  action: ActionType;
  errors: object | undefined;
}

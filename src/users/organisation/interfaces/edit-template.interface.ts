import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { ActionType } from '../../helpers/get-action-type-from-user';
import { UserEditSource } from '../../users.controller';
export class EditTemplate {
  organisationsSelectArgs: SelectItemArgs[];
  serviceOwnerRadioButtonArgs: RadioButtonArgs[];
  name: string;
  source: UserEditSource;
  action: ActionType;
  errors: object | undefined;
}

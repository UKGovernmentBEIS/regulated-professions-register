import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { ActionType } from '../../helpers/get-action-type-from-user';
import { UserEditSource } from '../../users.controller';

export interface EditTemplate {
  roleRadioButtonArgs: RadioButtonArgs[];
  source: UserEditSource;
  errors: object | undefined;
  action: ActionType;
  name: string;
}

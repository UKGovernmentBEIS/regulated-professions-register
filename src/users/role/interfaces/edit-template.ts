import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { ActionType } from '../../helpers/get-action-type-from-user';

export interface EditTemplate {
  roleRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  errors: object | undefined;
  action: ActionType;
  name: string;
}

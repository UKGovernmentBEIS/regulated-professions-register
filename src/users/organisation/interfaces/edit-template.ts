import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export class EditTemplate {
  organisationsSelectArgs: SelectItemArgs[];
  serviceOwnerRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  errors: object | undefined;
}

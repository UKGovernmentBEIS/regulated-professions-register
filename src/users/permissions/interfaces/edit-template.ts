import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';

export interface EditTemplate {
  roleRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  errors: object | undefined;
}

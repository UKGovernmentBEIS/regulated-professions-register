import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
export interface RegistrationTemplate {
  mandatoryRegistrationRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  captionText: string;
  errors: object | undefined;
}

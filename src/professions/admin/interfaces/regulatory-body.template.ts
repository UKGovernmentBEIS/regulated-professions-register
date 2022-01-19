import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export interface RegulatoryBodyTemplate {
  regulatedAuthoritiesSelectArgs: SelectItemArgs[];
  mandatoryRegistrationRadioButtonArgs: RadioButtonArgs[];
  change: boolean;
  captionText: string;
  backLink: string;
  errors: object | undefined;
}

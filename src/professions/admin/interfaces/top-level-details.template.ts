import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { CheckboxArgs } from '../../../common/interfaces/checkbox-args.interface';

export interface TopLevelDetailsTemplate {
  name: string | null;
  coversUK: string | null;
  industriesCheckboxItems: CheckboxItems[];
  nationsCheckboxArgs: CheckboxArgs;
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

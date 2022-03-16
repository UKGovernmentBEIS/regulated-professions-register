import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { CheckboxArgs } from '../../../common/interfaces/checkbox-args.interface';

export interface ScopeTemplate {
  coversUK: boolean | null;
  industriesCheckboxItems: CheckboxItems[];
  nationsCheckboxArgs: CheckboxArgs;
  captionText: string;
  errors: object | undefined;
}

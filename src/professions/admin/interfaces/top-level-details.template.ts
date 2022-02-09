import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';

export interface TopLevelDetailsTemplate {
  name: string | null;
  industriesCheckboxItems: CheckboxItems[];
  nationsCheckboxItems: CheckboxItems[];
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

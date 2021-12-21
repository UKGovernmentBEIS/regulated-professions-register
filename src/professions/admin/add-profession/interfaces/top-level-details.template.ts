import { CheckboxArgs } from './checkboxArgs';

export interface TopLevelDetailsTemplate {
  name: string | null;
  industriesCheckboxArgs: CheckboxArgs[];
  nationsCheckboxArgs: CheckboxArgs[];
  errors: object | undefined;
}

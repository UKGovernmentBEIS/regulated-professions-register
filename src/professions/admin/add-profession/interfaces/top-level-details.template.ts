import { CheckboxArgs } from '../../../../common/interfaces/checkbox-args.interface';

export interface TopLevelDetailsTemplate {
  name: string | null;
  industriesCheckboxArgs: CheckboxArgs[];
  nationsCheckboxArgs: CheckboxArgs[];
  change: boolean;
  errors: object | undefined;
}

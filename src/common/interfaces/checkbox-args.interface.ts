import { CheckboxItems } from './checkbox-items.interface';

export interface CheckboxArgs {
  idPrefix: string;
  name: string;
  hint: {
    text: string;
  };
  items: CheckboxItems[];
}

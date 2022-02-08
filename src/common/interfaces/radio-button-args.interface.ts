export interface RadioButtonArgs {
  text: string;
  value: string;
  checked: boolean;
  hint?: { html: string } | { text: string };
  conditional?: { html: string };
}

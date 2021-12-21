export interface TopLevelDetailsTemplate {
  name: string | null;
  industriesCheckboxArgs: { text: string; value: string; checked?: boolean }[];
  nationsCheckboxArgs: { text: string; value: string: checked?: boolean }[];
  errors: object | undefined;
}

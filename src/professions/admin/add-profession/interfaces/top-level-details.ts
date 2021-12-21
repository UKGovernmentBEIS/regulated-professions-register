export interface TopLevelDetailsTemplate {
  professionId: string;
  industriesCheckboxArgs: { text: string; value: string }[];
  nationsCheckboxArgs: { text: string; value: string }[];
  errors: object | undefined;
}

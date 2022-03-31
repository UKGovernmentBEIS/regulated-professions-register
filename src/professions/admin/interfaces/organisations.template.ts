import { AuthorityAndRoleArgs } from './../interfaces/authority-and-role-args';

export interface OrganisationsTemplate {
  selectArgsArray: AuthorityAndRoleArgs[];
  captionText: string;
  change: boolean;
  errors: object | undefined;
}

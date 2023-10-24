import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { getPermissionsFromUser } from '../helpers/get-permissions-from-user.helper';
import { Role } from '../role';
import { UserPermission } from '../user-permission';
import { User } from '../user.entity';

const descriptions = [
  {
    serviceOwnerText: 'users.roleDescriptions.manageUsers',
    nonServiceOwnerText: 'users.roleDescriptions.manageUsers',
    permissions: [UserPermission.CreateUser],
  },
  {
    serviceOwnerText:
      'users.roleDescriptions.manageProfessionsAndOrganisations',
    nonServiceOwnerText:
      'users.roleDescriptions.manageProfessionsAndOrganisations',
    permissions: [
      UserPermission.CreateOrganisation,
      UserPermission.CreateProfession,
    ],
  },
  {
    serviceOwnerText: 'users.roleDescriptions.editProfessionsAndOrganisations',
    nonServiceOwnerText:
      'users.roleDescriptions.editProfessionsAndOwnOrganisation',
    permissions: [UserPermission.EditProfession],
  },
];

export class RoleRadioButtonsPresenter {
  constructor(
    private readonly allRoles: Role[],
    private readonly serviceOwner: boolean,
    private readonly selectedRole: Role | null,
    private readonly i18nService: I18nService,
  ) {}

  radioButtonArgs(): RadioButtonArgs[] {
    return this.allRoles.map((role) => ({
      text: this.i18nService.translate<string>(`users.roles.${role}`) as string,
      value: role,
      checked: this.selectedRole === role,
      hint: { html: this.getHintHtml(role, this.serviceOwner) },
    }));
  }

  private getHintHtml(role: Role, serviceOwner: boolean): string {
    const permissions = getPermissionsFromUser({
      ...new User(),
      role,
      serviceOwner,
    });

    const lines = descriptions
      .filter((description) =>
        description.permissions.every((permission) =>
          permissions.includes(permission),
        ),
      )
      .map((description) =>
        this.i18nService.translate<string>(
          serviceOwner
            ? description.serviceOwnerText
            : description.nonServiceOwnerText,
        ),
      );

    return lines.join('<br />');
  }
}

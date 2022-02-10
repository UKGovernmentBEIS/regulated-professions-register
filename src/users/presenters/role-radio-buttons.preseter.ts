import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { getPermissionsFromUser } from '../helpers/get-permissions-from-user.helper';
import { Role } from '../role';
import { UserPermission } from '../user-permission';
import { User } from '../user.entity';

const descriptions = [
  {
    serviceOwnerText: 'users.roleDescriptions.managerUsers',
    nonServiceOwnerText: 'users.roleDescriptions.managerUsers',
    permissions: [UserPermission.CreateUser],
  },
  {
    serviceOwnerText:
      'users.roleDescriptions.managerProfessionsAndOrganisations',
    nonServiceOwnerText:
      'users.roleDescriptions.managerProfessionsAndOrganisations',
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

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return Promise.all(
      this.allRoles.map(async (role) => ({
        text: await this.i18nService.translate(`users.roles.${role}`),
        value: role,
        checked: this.selectedRole === role,
        hint: { html: await this.getHintHtml(role, this.serviceOwner) },
      })),
    );
  }

  private async getHintHtml(
    role: Role,
    serviceOwner: boolean,
  ): Promise<string> {
    const permissions = getPermissionsFromUser({
      ...new User(),
      role,
      serviceOwner,
    });

    const lines = await Promise.all(
      descriptions
        .filter((description) =>
          description.permissions.every((permission) =>
            permissions.includes(permission),
          ),
        )
        .map(
          (description) =>
            this.i18nService.translate(
              serviceOwner
                ? description.serviceOwnerText
                : description.nonServiceOwnerText,
            ) as Promise<string>,
        ),
    );

    return lines.join('<br />');
  }
}

import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../common/interfaces/radio-button-args.interface';
import { Role } from './role';

export class RoleRadioButtonsPresenter {
  constructor(
    private readonly allRoles: Role[],
    private readonly selectedRole: Role | null,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return Promise.all(
      this.allRoles.map(async (role) => ({
        text: await this.i18nService.translate(`users.roles.${role}`),
        value: role,
        checked: this.selectedRole === role,
        hint: { html: await this.getHintHtml(role) },
      })),
    );
  }

  private async getHintHtml(role: Role): Promise<string> {
    const descriptions = [
      {
        text: 'users.roleDescriptions.managerUsers',
        roles: [Role.Administrator],
      },
      {
        text: 'users.roleDescriptions.managerProfessionsAndOrganisations',
        roles: [Role.Administrator, Role.Registrar],
      },
      {
        text: 'users.roleDescriptions.editProfessionsAndOrganisations',
        roles: [Role.Administrator, Role.Registrar, Role.Editor],
      },
    ];

    const lines = await Promise.all(
      descriptions
        .filter((description) => description.roles.includes(role))
        .map(
          (description) =>
            this.i18nService.translate(description.text) as Promise<string>,
        ),
    );

    return lines.join('<br />');
  }
}

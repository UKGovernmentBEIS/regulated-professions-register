import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { AuthorityAndRoleArgs } from './../interfaces/authority-and-role-args';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationRole } from '../../profession-to-organisation.entity';
import { I18nService } from 'nestjs-i18n';

export class RegulatedAuthoritiesSelectPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly selectedOrganisation: Organisation | null,
    private readonly selectedRole?: OrganisationRole | null,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: '--- Please Select ---',
        value: '',
        selected: null,
      },
    ];

    this.allOrganisations.forEach((organisation) =>
      options.push({
        text: organisation.name,
        value: organisation.id,
        selected: this.selectedOrganisation
          ? this.selectedOrganisation.id === organisation.id
          : false,
      }),
    );

    return options;
  }

  async roleArgs(i18nService: I18nService): Promise<SelectItemArgs[]> {
    const options = [
      {
        text: '--- Please Select ---',
        value: '',
        selected: null,
      },
    ];

    for (const role of Object.values(OrganisationRole)) {
      options.push({
        text: await i18nService.translate(`organisations.label.roles.${role}`),
        value: role,
        selected: this.selectedRole ? this.selectedRole === role : false,
      });
    }

    return options;
  }

  async authoritiesAndRoles(
    i18nService: I18nService,
  ): Promise<AuthorityAndRoleArgs> {
    return {
      authorities: this.selectArgs(),
      roles: await this.roleArgs(i18nService),
    };
  }
}

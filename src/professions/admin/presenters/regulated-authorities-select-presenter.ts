import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { AuthorityAndRoleArgs } from './../interfaces/authority-and-role-args';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationRole } from '../../profession-to-organisation.entity';
import { I18nService } from 'nestjs-i18n';

export class RegulatedAuthoritiesSelectPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly selectedOrganisation: Organisation | null,
    private readonly selectedRole: OrganisationRole | null,
    private readonly i18nService: I18nService,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect') as string,
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

  roleArgs(): SelectItemArgs[] {
    const options = [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect') as string,
        value: '',
        selected: null,
      },
    ];

    for (const role of Object.values(OrganisationRole)) {
      options.push({
        text: this.i18nService.translate<string>(
          `organisations.label.roles.${role}`,
        ) as string,
        value: role,
        selected: this.selectedRole ? this.selectedRole === role : false,
      });
    }

    return options;
  }

  authoritiesAndRoles(): AuthorityAndRoleArgs {
    return {
      authorities: this.selectArgs(),
      roles: this.roleArgs(),
    };
  }
}

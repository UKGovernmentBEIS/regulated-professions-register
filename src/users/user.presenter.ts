import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';
import { I18nService } from 'nestjs-i18n';
import { escape } from '../helpers/escape.helper';
import { getPermissionsFromUser } from './helpers/get-permissions-from-user.helper';

export class UserPresenter extends User {
  constructor(private user: User, private i18n: I18nService) {
    super(
      user.email,
      user.name,
      user.externalIdentifier,
      user.role,
      user.serviceOwner,
      user.confirmed,
    );
  }

  public tableRow(): TableRow {
    return [
      {
        text: this.name,
      },
      {
        text: this.email,
      },
      {
        html: this.showLink(),
      },
    ];
  }

  public showLink(): string {
    return `
      <a href="/admin/users/${
        this.user.id
      }" class="govuk-button" data-module="govuk-button">
        View
        <span class="govuk-visually-hidden">
          ${escape(this.name)}
        </span>
      </a>
    `;
  }

  public async permissionList(): Promise<string> {
    const permissions = await Promise.all(
      getPermissionsFromUser(this).map((permission) => {
        return this.i18n.translate(`users.form.label.${permission}`);
      }),
    );

    return permissions.join('<br />');
  }
}

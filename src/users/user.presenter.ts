import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';
import { I18nService } from 'nestjs-i18n';

export class UserPresenter extends User {
  constructor(private user: User, private i18n: I18nService) {
    super(
      user.email,
      user.name,
      user.externalIdentifier,
      user.roles,
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
      <a href="/admin/users/${this.user.id}" class="govuk-button" data-module="govuk-button">
        View
        <span class="govuk-visually-hidden">
          ${this.name}
        </span>
      </a>
    `;
  }

  public async roleList(): Promise<string> {
    const roles = await Promise.all(
      this.roles.map((role) => {
        return this.i18n.translate(`users.form.label.${role}`);
      }),
    );

    return roles.join('<br />');
  }
}

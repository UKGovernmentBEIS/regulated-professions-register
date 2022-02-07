import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';
import { escape } from '../helpers/escape.helper';

export class UserPresenter extends User {
  constructor(private user: User) {
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
}

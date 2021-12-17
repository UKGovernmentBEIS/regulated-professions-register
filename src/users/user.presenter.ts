import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';

export class UserPresenter extends User {
  constructor(private user: User) {
    super(...Object.values(user));
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
}

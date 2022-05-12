import { User } from '../user.entity';
import { TableRow } from '../../common/interfaces/table-row';
import { escape } from '../../helpers/escape.helper';
import { I18nService } from 'nestjs-i18n';

export class UserPresenter extends User {
  constructor(
    private readonly user: User,
    private readonly i18nService: I18nService,
  ) {
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
      <a href="/admin/users/${this.user.id}" class="govuk-link">
      ${this.i18nService.translate<string>('users.table.viewDetails', {
        args: { name: escape(this.name) },
      })}
      </a>
    `;
  }
}

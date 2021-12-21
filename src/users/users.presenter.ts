import { I18nService } from 'nestjs-i18n';

import { UserPresenter } from './user.presenter';
import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';

export class UsersPresenter {
  users: UserPresenter[];

  constructor(users: User[], private i18n: I18nService) {
    this.users = users.map((user) => {
      return new UserPresenter(user, i18n);
    });
  }

  public tableRows(): TableRow[] {
    return this.users.map((user) => {
      return user.tableRow();
    });
  }
}

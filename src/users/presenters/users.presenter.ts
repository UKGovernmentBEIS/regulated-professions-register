import { UserPresenter } from './user.presenter';
import { User } from '../user.entity';
import { TableRow } from '../../common/interfaces/table-row';
import { I18nService } from 'nestjs-i18n';

export class UsersPresenter {
  private readonly users: UserPresenter[];

  constructor(users: User[], i18nService: I18nService) {
    this.users = users.map((user) => {
      return new UserPresenter(user, i18nService);
    });
  }

  public tableRows(): TableRow[] {
    return this.users.map((user) => {
      return user.tableRow();
    });
  }
}

import { UserPresenter } from './user.presenter';
import { User } from './user.entity';
import { TableRow } from '../common/interfaces/table-row';

export class UsersPresenter {
  users: UserPresenter[];

  constructor(users: User[]) {
    this.users = users.map((user) => {
      return new UserPresenter(user);
    });
  }

  public tableRows(): TableRow[] {
    return this.users.map((user) => {
      return user.tableRow();
    });
  }
}

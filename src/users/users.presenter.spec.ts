import { User } from './user.entity';
import { UsersPresenter } from './users.presenter';
import { TableRow } from '../common/interfaces/table-row';

const users = [
  new User('email@example.com', 'name', '212121'),
  new User('email2@example.com', 'name2', '12345'),
];

describe('UsersPresenter', () => {
  let presenter: UsersPresenter;

  beforeEach(() => {
    presenter = new UsersPresenter(users);
  });

  describe('tableRows', () => {
    it('returns an array of table rows', () => {
      const rows = presenter.tableRows();

      expect(rows.length).toEqual(2);
    });
  });
});

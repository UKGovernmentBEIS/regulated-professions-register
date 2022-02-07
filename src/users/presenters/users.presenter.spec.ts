import userFactory from '../../testutils/factories/user';

import { UsersPresenter } from './users.presenter';

describe('UsersPresenter', () => {
  describe('tableRows', () => {
    it('returns an array of table rows', () => {
      const users = userFactory.buildList(2);

      const presenter = new UsersPresenter(users);
      const rows = presenter.tableRows();

      expect(rows.length).toEqual(2);
    });
  });
});

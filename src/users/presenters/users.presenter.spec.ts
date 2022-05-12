import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import userFactory from '../../testutils/factories/user';

import { UsersPresenter } from './users.presenter';

describe('UsersPresenter', () => {
  describe('tableRows', () => {
    it('returns an array of table rows', () => {
      const i18nService = createMockI18nService();
      const users = userFactory.buildList(2);

      const presenter = new UsersPresenter(users, i18nService);
      const rows = presenter.tableRows();

      expect(rows.length).toEqual(2);
    });
  });
});

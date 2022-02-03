import { createMock } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import userFactory from '../testutils/factories/user';

import { UsersPresenter } from './users.presenter';

describe('UsersPresenter', () => {
  describe('tableRows', () => {
    it('returns an array of table rows', () => {
      const users = userFactory.buildList(2);
      const i18nService = createMock<I18nService>();

      const presenter = new UsersPresenter(users, i18nService);
      const rows = presenter.tableRows();

      expect(rows.length).toEqual(2);
    });
  });
});

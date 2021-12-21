import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { User } from './user.entity';
import { UsersPresenter } from './users.presenter';

const users = [
  createMock<User>({
    id: 'some-uuid-string',
    name: 'name',
    email: 'email@example.com',
    externalIdentifier: '212121',
  }),
  createMock<User>({
    id: 'some-other-uuid-string',
    name: 'name2',
    email: 'emai2l@example.com',
    externalIdentifier: '12345',
  }),
];

describe('UsersPresenter', () => {
  let presenter: UsersPresenter;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMock<I18nService>();
    presenter = new UsersPresenter(users, i18nService);
  });

  describe('tableRows', () => {
    it('returns an array of table rows', () => {
      const rows = presenter.tableRows();

      expect(rows.length).toEqual(2);
    });
  });
});

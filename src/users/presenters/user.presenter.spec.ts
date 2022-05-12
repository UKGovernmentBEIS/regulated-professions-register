import { escape } from '../../helpers/escape.helper';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { escapeOf } from '../../testutils/escape-of';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';

import { UserPresenter } from './user.presenter';

jest.mock('../../helpers/escape.helper');
jest.mock('../helpers/get-permissions-from-user.helper');

describe('UserPresenter', () => {
  describe('tableRow', () => {
    it('should return a table row', () => {
      const user = userFactory.build();
      const i18nService = createMockI18nService();

      const presenter = new UserPresenter(user, i18nService);

      expect(presenter.tableRow()).toEqual([
        {
          text: user.name,
        },
        {
          text: user.email,
        },
        {
          html: presenter.showLink(),
        },
      ]);
    });
  });

  describe('showLink', () => {
    it('should return a link to the user', () => {
      const i18nService = createMockI18nService();
      (escape as jest.Mock).mockImplementation(escapeOf);

      const user = userFactory.build();
      const presenter = new UserPresenter(user, i18nService);

      const expected = `
      <a href="/admin/users/${user.id}" class="govuk-link">
      ${translationOf('users.table.viewDetails')}
      </a>
    `.replace(/(\n)/gm, '');
      expect(presenter.showLink().replace(/(\n)/gm, '')).toEqual(expected);

      expect(escape).toBeCalledWith(user.name);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

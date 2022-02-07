import { escape } from '../../helpers/escape.helper';
import { escapeOf } from '../../testutils/escape-of';
import userFactory from '../../testutils/factories/user';

import { UserPresenter } from './user.presenter';

jest.mock('../../helpers/escape.helper');
jest.mock('../helpers/get-permissions-from-user.helper');

describe('UserPresenter', () => {
  describe('tableRow', () => {
    it('should return a table row', () => {
      const user = userFactory.build();
      const presenter = new UserPresenter(user);

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
      (escape as jest.Mock).mockImplementation(escapeOf);

      const user = userFactory.build();
      const presenter = new UserPresenter(user);

      const expected = `
      <a href="/admin/users/${
        user.id
      }" class="govuk-button" data-module="govuk-button">
        View
        <span class="govuk-visually-hidden">
          ${escapeOf(user.name)}
        </span>
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

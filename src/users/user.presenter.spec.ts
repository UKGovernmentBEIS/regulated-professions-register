import { User } from './user.entity';
import { UserPresenter } from './user.presenter';

const user = new User('email@example.com', 'name', '212121');

describe('UserPresenter', () => {
  let presenter: UserPresenter;

  beforeEach(() => {
    presenter = new UserPresenter(user);
    user.id = 'some-uuid-string';
  });

  describe('tableRow', () => {
    it('should return a table row', () => {
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
      const expected = `
      <a href="/admin/users/some-uuid-string" class="govuk-button" data-module="govuk-button">
        View
        <span class="govuk-visually-hidden">
          name
        </span>
      </a>
    `.replace(/(\n)/gm, '');
      expect(presenter.showLink().replace(/(\n)/gm, '')).toEqual(expected);
    });
  });
});

import { escape } from '../helpers/escape.helper';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { escapeOf } from '../testutils/escape-of';
import userFactory from '../testutils/factories/user';
import { translationOf } from '../testutils/translation-of';

import { User, UserPermission } from './user.entity';
import { UserPresenter } from './user.presenter';

jest.mock('../helpers/escape.helper');

describe('UserPresenter', () => {
  describe('tableRow', () => {
    it('should return a table row', () => {
      const user = createSinglePermissionUser();
      const presenter = new UserPresenter(user, createMockI18nService());

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

      const user = createSinglePermissionUser();
      const presenter = new UserPresenter(user, createMockI18nService());

      const expected = `
      <a href="/admin/users/some-uuid-string" class="govuk-button" data-module="govuk-button">
        View
        <span class="govuk-visually-hidden">
          ${escapeOf('name')}
        </span>
      </a>
    `.replace(/(\n)/gm, '');
      expect(presenter.showLink().replace(/(\n)/gm, '')).toEqual(expected);

      expect(escape).toBeCalledWith('name');
    });
  });

  describe('permissionList', () => {
    it('should return a single permission', async () => {
      const user = createSinglePermissionUser();
      const presenter = new UserPresenter(user, createMockI18nService());

      expect(await presenter.permissionList()).toEqual(
        translationOf('users.form.label.createUser'),
      );
    });

    describe('when there are multiple permissions', () => {
      it('should return a list of permissions', async () => {
        const user = createMultiPermissionUser();
        const presenter = new UserPresenter(user, createMockI18nService());

        expect(await presenter.permissionList()).toEqual(
          `${translationOf('users.form.label.createUser')}<br />${translationOf(
            'users.form.label.deleteUser',
          )}`,
        );
      });
    });
  });
});

function createSinglePermissionUser(): User {
  const permissions: UserPermission[] = [UserPermission.CreateUser];
  const user = userFactory.build({
    id: 'some-uuid-string',
    email: 'email@example.com',
    name: 'name',
    externalIdentifier: '212121',
    permissions: permissions,
  });

  return user;
}

function createMultiPermissionUser(): User {
  const permissions: UserPermission[] = [
    UserPermission.CreateUser,
    UserPermission.DeleteUser,
  ];
  const user = userFactory.build({
    id: 'some-uuid-string',
    name: 'name',
    email: 'email@example.com',
    externalIdentifier: '212121',
    permissions: permissions,
  });

  return user;
}

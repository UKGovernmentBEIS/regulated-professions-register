import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import userFactory from '../testutils/factories/user';

import { UserPermission } from './user.entity';
import { UserPresenter } from './user.presenter';

describe('UserPresenter', () => {
  const permissions: UserPermission[] = [UserPermission.CreateUser];
  const user = userFactory.build({
    id: 'some-uuid-string',
    email: 'email@example.com',
    name: 'name',
    externalIdentifier: '212121',
    permissions: permissions,
  });
  const i18nService: DeepMocked<I18nService> = createMock<I18nService>();
  let presenter: UserPresenter;

  beforeEach(() => {
    presenter = new UserPresenter(user, i18nService);
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

  describe('permissionList', () => {
    it('should return a single permission', async () => {
      i18nService.translate.mockResolvedValue('Create User');

      expect(await presenter.permissionList()).toEqual('Create User');
      expect(i18nService.translate).toHaveBeenCalledWith(
        'users.form.label.createUser',
      );
    });

    describe('when there are multiple permissions', () => {
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

      beforeEach(() => {
        presenter = new UserPresenter(user, i18nService);
      });

      it('should return a list of permissions', async () => {
        i18nService.translate
          .mockResolvedValueOnce('Create User')
          .mockResolvedValueOnce('Delete User');

        expect(await presenter.permissionList()).toEqual(
          'Create User<br />Delete User',
        );
        expect(i18nService.translate).toHaveBeenCalledWith(
          'users.form.label.createUser',
        );
        expect(i18nService.translate).toHaveBeenCalledWith(
          'users.form.label.deleteUser',
        );
      });
    });
  });
});

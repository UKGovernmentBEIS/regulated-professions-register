import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { User, UserRole } from './user.entity';
import { UserPresenter } from './user.presenter';

describe('UserPresenter', () => {
  const roles: UserRole[] = [UserRole.Admin];
  const user: DeepMocked<User> = createMock<User>({
    id: 'some-uuid-string',
    email: 'email@example.com',
    name: 'name',
    externalIdentifier: '212121',
    roles: roles,
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

  describe('roleList', () => {
    it('should return a single role', async () => {
      i18nService.translate.mockResolvedValue('Administrator');

      expect(await presenter.roleList()).toEqual('Administrator');
      expect(i18nService.translate).toHaveBeenCalledWith(
        'users.form.label.admin',
      );
    });

    describe('when there are multiple roles', () => {
      const roles: UserRole[] = [UserRole.Admin, UserRole.Editor];
      const user: DeepMocked<User> = createMock<User>({
        id: 'some-uuid-string',
        name: 'name',
        email: 'email@example.com',
        externalIdentifier: '212121',
        roles: roles,
      });

      beforeEach(() => {
        presenter = new UserPresenter(user, i18nService);
      });

      it('should return a list of roles', async () => {
        i18nService.translate
          .mockResolvedValueOnce('Administrator')
          .mockResolvedValueOnce('Editor');

        expect(await presenter.roleList()).toEqual('Administrator<br />Editor');
        expect(i18nService.translate).toHaveBeenCalledWith(
          'users.form.label.admin',
        );
        expect(i18nService.translate).toHaveBeenCalledWith(
          'users.form.label.editor',
        );
      });
    });
  });
});

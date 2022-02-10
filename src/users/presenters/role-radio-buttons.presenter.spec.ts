import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { getPermissionsFromUser } from '../helpers/get-permissions-from-user.helper';
import { Role } from '../role';
import { UserPermission } from '../user-permission';
import { RoleRadioButtonsPresenter } from './role-radio-buttons.preseter';

jest.mock('../helpers/get-permissions-from-user.helper');

describe('RoleRadioButtonsPresenter', () => {
  describe('radioButtonArgs', () => {
    describe('when we we are presenting roles for a service owner', () => {
      it('returns an array of `RadioButtonArg`s with correct hints and checked values', async () => {
        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateOrganisation,
          UserPermission.CreateProfession,
          UserPermission.EditProfession,
        ]);

        const presenter = new RoleRadioButtonsPresenter(
          [Role.Administrator, Role.Registrar, Role.Editor],
          true,
          Role.Registrar,
          createMockI18nService(),
        );

        const result = await presenter.radioButtonArgs();

        const registrarHint = `${translationOf(
          'users.roleDescriptions.manageProfessionsAndOrganisations',
        )}<br />${translationOf(
          'users.roleDescriptions.editProfessionsAndOrganisations',
        )}`;

        expect(result).toHaveLength(3);
        expect(result).toMatchObject([
          {
            text: translationOf('users.roles.administrator'),
            value: Role.Administrator,
            checked: false,
          },
          {
            text: translationOf('users.roles.registrar'),
            value: Role.Registrar,
            checked: true,
            hint: { html: registrarHint },
          },
          {
            text: translationOf('users.roles.editor'),
            value: Role.Editor,
            checked: false,
          },
        ]);

        expect(getPermissionsFromUser).toBeCalledWith(
          expect.objectContaining({ serviceOwner: true }),
        );
      });
    });

    describe('when we we are presenting roles for a non-service owner', () => {
      it('returns an array of `RadioButtonArg`s with correct hints and checked values', async () => {
        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateUser,
          UserPermission.EditProfession,
        ]);

        const presenter = new RoleRadioButtonsPresenter(
          [Role.Administrator, Role.Editor],
          false,
          Role.Registrar,
          createMockI18nService(),
        );

        const result = await presenter.radioButtonArgs();

        const administratorHint = `${translationOf(
          'users.roleDescriptions.manageUsers',
        )}<br />${translationOf(
          'users.roleDescriptions.editProfessionsAndOwnOrganisation',
        )}`;

        expect(result).toHaveLength(2);
        expect(result).toMatchObject([
          {
            text: translationOf('users.roles.administrator'),
            value: Role.Administrator,
            checked: false,
            hint: { html: administratorHint },
          },
          {
            text: translationOf('users.roles.editor'),
            value: Role.Editor,
            checked: false,
          },
        ]);

        expect(getPermissionsFromUser).toBeCalledWith(
          expect.objectContaining({ serviceOwner: false }),
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

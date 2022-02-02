import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { translationOf } from '../testutils/translation-of';
import { Role } from './role';
import { RoleRadioButtonsPresenter } from './role-radio-buttons.preseter';

describe('RoleRadioButtonsPresenter', () => {
  describe('radioButtonArgs', () => {
    it('returns an array of `RadioButtonArg`s with correct hints and checked values', async () => {
      const presenter = new RoleRadioButtonsPresenter(
        [Role.Administrator, Role.Registrar, Role.Editor],
        Role.Registrar,
        createMockI18nService(),
      );

      const result = await presenter.radioButtonArgs();

      const registrarHint = `${translationOf(
        'users.roleDescriptions.managerProfessionsAndOrganisations',
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
    });
  });
});

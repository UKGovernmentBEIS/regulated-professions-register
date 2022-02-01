import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { translationOf } from '../testutils/translation-of';
import { ServiceOwnerRadioButtonArgsPresenter } from './service-owner-radio-buttons.presenter';

describe('ServiceOwnerRadioButtonsPresenter', () => {
  describe('radioButtonArgs', () => {
    it('returns an array of `RadioButtonArg`s', async () => {
      const presenter = new ServiceOwnerRadioButtonArgsPresenter(
        true,
        createMockI18nService(),
      );

      const result = await presenter.radioButtonArgs();

      expect(result).toMatchObject([
        {
          text: translationOf('users.form.label.serviceOwner.yes'),
          value: '1',
          checked: true,
        },
        {
          text: translationOf('users.form.label.serviceOwner.no'),
          value: '0',
          checked: false,
        },
      ]);
    });
  });
});

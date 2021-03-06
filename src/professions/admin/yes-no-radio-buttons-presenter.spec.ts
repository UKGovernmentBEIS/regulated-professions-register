import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { YesNoRadioButtonArgsPresenter } from './yes-no-radio-buttons-presenter';

describe(YesNoRadioButtonArgsPresenter, () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMockI18nService({
      'app.yes': 'Yes',
      'app.no': 'No',
    });
  });

  describe('radioButtonArgs', () => {
    it('should return translated values with unchecked radio buttons when called with a null Yes or No value', () => {
      const presenter = new YesNoRadioButtonArgsPresenter(null, i18nService);

      expect(presenter.radioButtonArgs()).toEqual([
        {
          text: 'Yes',
          value: '1',
          checked: false,
        },
        {
          text: 'No',
          value: '0',
          checked: false,
        },
      ]);
    });

    it('should pre-check the relevant radio button for the relevant boolean value', () => {
      const truePresenter = new YesNoRadioButtonArgsPresenter(
        true,
        i18nService,
      );

      const falsePresenter = new YesNoRadioButtonArgsPresenter(
        false,
        i18nService,
      );

      expect(truePresenter.radioButtonArgs()).toEqual([
        {
          text: 'Yes',
          value: '1',
          checked: true,
        },
        {
          text: 'No',
          value: '0',
          checked: false,
        },
      ]);

      expect(falsePresenter.radioButtonArgs()).toEqual([
        {
          text: 'Yes',
          value: '1',
          checked: false,
        },
        {
          text: 'No',
          value: '0',
          checked: true,
        },
      ]);
    });
  });
});

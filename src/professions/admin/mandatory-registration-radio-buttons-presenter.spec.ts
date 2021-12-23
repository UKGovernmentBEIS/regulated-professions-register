import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { MandatoryRegistration } from '../profession.entity';
import { MandatoryRegistrationRadioButtonsPresenter } from './mandatory-registration-radio-buttons-presenter';

describe(MandatoryRegistrationRadioButtonsPresenter, () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'professions.form.radioButtons.mandatoryRegistration.mandatory':
          return 'Mandatory';
        case 'professions.form.radioButtons.mandatoryRegistration.voluntary':
          return 'Voluntary';
        case 'professions.form.radioButtons.mandatoryRegistration.unknown':
          return 'Unknown';
        default:
          return '';
      }
    });
  });

  describe('radioButtonArgs', () => {
    it('should return translated values with unchecked radio buttons when called with a null Mandatory Registration value', async () => {
      const presenter = new MandatoryRegistrationRadioButtonsPresenter(
        null,
        i18nService,
      );

      await expect(presenter.radioButtonArgs()).resolves.toEqual([
        {
          text: 'Mandatory',
          value: MandatoryRegistration.Mandatory,
          checked: false,
        },
        {
          text: 'Voluntary',
          value: MandatoryRegistration.Voluntary,
          checked: false,
        },
        {
          text: 'Unknown',
          value: MandatoryRegistration.Unknown,
          checked: false,
        },
      ]);
    });

    it('should pre-check the relevant radio button for a matching Mandatory Registration value', async () => {
      const presenter = new MandatoryRegistrationRadioButtonsPresenter(
        MandatoryRegistration.Mandatory,
        i18nService,
      );

      await expect(presenter.radioButtonArgs()).resolves.toEqual([
        {
          text: 'Mandatory',
          value: MandatoryRegistration.Mandatory,
          checked: true,
        },
        {
          text: 'Voluntary',
          value: MandatoryRegistration.Voluntary,
          checked: false,
        },
        {
          text: 'Unknown',
          value: MandatoryRegistration.Unknown,
          checked: false,
        },
      ]);
    });
  });
});

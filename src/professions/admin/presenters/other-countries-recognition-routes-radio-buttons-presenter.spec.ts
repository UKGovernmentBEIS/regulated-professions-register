import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { OtherCountriesRecognitionRoutes } from '../../../qualifications/qualification.entity';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { OtherCountriesRecognitionRoutesRadioButtonsPresenter } from './other-countries-recognition-routes-radio-buttons-presenter';

describe('OtherCountriesRecognitionRoutesRadioButtonsPresenter', () => {
  describe('radioButtonArgs', () => {
    describe('when the current route is empty', () => {
      it('returns an array of `RadioButtonArgs`, with no option checked', async () => {
        const i18nService = createMockI18nService();

        const presenter =
          new OtherCountriesRecognitionRoutesRadioButtonsPresenter(
            null,
            i18nService,
          );

        const expected: RadioButtonArgs[] = [
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.none',
            ),
            value: 'none',
            checked: false,
          },
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.some',
            ),
            value: 'some',
            checked: false,
          },
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.all',
            ),
            value: 'all',
            checked: false,
          },
        ];

        await expect(presenter.radioButtonArgs()).resolves.toEqual(expected);
      });
    });

    describe('when the route is non-empty', () => {
      it('returns an array of `RadioButtonArgs`, with the route type checked', async () => {
        const i18nService = createMockI18nService();

        const presenter =
          new OtherCountriesRecognitionRoutesRadioButtonsPresenter(
            OtherCountriesRecognitionRoutes.All,
            i18nService,
          );

        const expected: RadioButtonArgs[] = [
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.none',
            ),
            value: OtherCountriesRecognitionRoutes.None,
            checked: false,
          },
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.some',
            ),
            value: OtherCountriesRecognitionRoutes.Some,
            checked: false,
          },
          {
            text: translationOf(
              'professions.form.label.qualifications.otherCountriesRecognition.routes.all',
            ),
            value: OtherCountriesRecognitionRoutes.All,
            checked: true,
          },
        ];

        await expect(presenter.radioButtonArgs()).resolves.toEqual(expected);
      });
    });
  });
});

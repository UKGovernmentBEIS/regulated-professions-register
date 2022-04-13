import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { CountriesSelectPresenter } from './countries-select.presenter';

describe('CountrySelectPresenter', () => {
  describe('selectArgs', () => {
    describe('when given a null selected country', () => {
      it('returns a list of countries, with no country selected', () => {
        const presenter = new CountriesSelectPresenter(
          null,
          createMockI18nService(),
        );

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: 'France',
            value: 'France',
            selected: false,
          },
          {
            text: 'Belgium',
            value: 'Belgium',
            selected: false,
          },
          {
            text: 'Brazil',
            value: 'Brazil',
            selected: false,
          },
          {
            text: 'Japan',
            value: 'Japan',
            selected: false,
          },
          {
            text: 'Morocco',
            value: 'Morocco',
            selected: false,
          },
          {
            text: 'Poland',
            value: 'Poland',
            selected: false,
          },
          {
            text: 'Germany',
            value: 'Germany',
            selected: false,
          },
          {
            text: 'Italy',
            value: 'Italy',
            selected: false,
          },
          {
            text: 'Canada',
            value: 'Canada',
            selected: false,
          },
        ];

        const result = presenter.selectArgs();

        expect(expected).toEqual(result);
      });
    });

    describe('when given a selected country', () => {
      it('returns a list of countries, with the given country selected', () => {
        const presenter = new CountriesSelectPresenter(
          'Morocco',
          createMockI18nService(),
        );

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: 'France',
            value: 'France',
            selected: false,
          },
          {
            text: 'Belgium',
            value: 'Belgium',
            selected: false,
          },
          {
            text: 'Brazil',
            value: 'Brazil',
            selected: false,
          },
          {
            text: 'Japan',
            value: 'Japan',
            selected: false,
          },
          {
            text: 'Morocco',
            value: 'Morocco',
            selected: true,
          },
          {
            text: 'Poland',
            value: 'Poland',
            selected: false,
          },
          {
            text: 'Germany',
            value: 'Germany',
            selected: false,
          },
          {
            text: 'Italy',
            value: 'Italy',
            selected: false,
          },
          {
            text: 'Canada',
            value: 'Canada',
            selected: false,
          },
        ];
        const result = presenter.selectArgs();

        expect(expected).toEqual(result);
      });
    });
  });
});

import { SelectItemArgs } from '../../common/interfaces/select-item-args.interface';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { CountriesSelectPresenter } from './countries-select.presenter';
import { Country } from '../country';

const mockCountries = <const>[
  new Country('countries.fr', 'FR'),
  new Country('countries.be', 'BE'),
  new Country('countries.cy', 'CY'),
  new Country('countries.jp', 'JP'),
];

describe('CountrySelectPresenter', () => {
  describe('selectArgs', () => {
    describe('when given a null selected country', () => {
      it('returns a list of countries, with no country selected', () => {
        const presenter = new CountriesSelectPresenter(
          mockCountries,
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
            text: translationOf('countries.fr'),
            value: 'FR',
            selected: false,
          },
          {
            text: translationOf('countries.be'),
            value: 'BE',
            selected: false,
          },
          {
            text: translationOf('countries.cy'),
            value: 'CY',
            selected: false,
          },
          {
            text: translationOf('countries.jp'),
            value: 'JP',
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
          mockCountries,
          new Country('countries.be', 'BE'),
          createMockI18nService(),
        );

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: translationOf('countries.fr'),
            value: 'FR',
            selected: false,
          },
          {
            text: translationOf('countries.be'),
            value: 'BE',
            selected: true,
          },
          {
            text: translationOf('countries.cy'),
            value: 'CY',
            selected: false,
          },
          {
            text: translationOf('countries.jp'),
            value: 'JP',
            selected: false,
          },
        ];

        const result = presenter.selectArgs();

        expect(expected).toEqual(result);
      });
    });
  });
});

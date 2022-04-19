import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { CountriesSelectPresenter } from './countries-select.presenter';

describe('CountrySelectPresenter', () => {
  describe('when given a null selected country', () => {
    it('retunrs a list of countries, with no country selected', () => {
      const presenter = new CountriesSelectPresenter(null);

      const expected: SelectItemArgs[] = [
        {
          text: '--- Please Select ---',
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
      const presenter = new CountriesSelectPresenter('Morocco');

      const expected: SelectItemArgs[] = [
        {
          text: '--- Please Select ---',
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

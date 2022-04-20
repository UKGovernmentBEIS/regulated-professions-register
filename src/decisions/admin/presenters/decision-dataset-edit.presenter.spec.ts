import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { Country } from '../../../countries/country';
import { CountriesSelectPresenter } from '../../../countries/presenters/countries-select.presenter';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import * as decisionValueToStringModule from '../helpers/decision-value-to-string.helper';
import { RouteTemplate } from '../interfaces/route-template.interface';
import { DecisionDatasetEditPresenter } from './decision-dataset-edit.presenter';

jest.mock('../../../countries/presenters/countries-select.presenter');
jest.mock('../../../countries/country');

const mockCountries = <const>[
  { name: 'countries.fr', code: 'FR' },
  { name: 'countries.be', code: 'BE' },
  { name: 'countries.cy', code: 'CY' },
  { name: 'countries.jp', code: 'JP' },
];

const mockCountriesSelectArgs: SelectItemArgs[] = [
  {
    text: 'Cyprus',
    value: 'CY',
    selected: false,
  },
];

describe('DecisionDatasetEditPresenter', () => {
  describe('when given an array of decision routes', () => {
    it('presents the given decision routes', () => {
      (Country.all as jest.Mock).mockReturnValue(mockCountries);
      (Country.find as jest.Mock).mockImplementation((code) => ({ code }));

      const decisionValueToStringSpy = jest.spyOn(
        decisionValueToStringModule,
        'decisionValueToString',
      );

      (
        CountriesSelectPresenter.prototype.selectArgs as jest.Mock
      ).mockReturnValue(mockCountriesSelectArgs);

      const spotCheckCountryCode = 'CA';
      const spotCheckValue = 6;

      const routes: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: null,
              decisions: {
                yes: 4,
                no: 5,
                yesAfterComp: spotCheckValue,
                noAfterComp: 7,
              },
            },
            {
              code: 'CA',
              decisions: {
                yes: 5,
                no: 8,
                yesAfterComp: 0,
                noAfterComp: 4,
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              code: 'FR',
              decisions: {
                yes: 1,
                no: 3,
                yesAfterComp: 11,
                noAfterComp: 2,
              },
            },
          ],
        },
      ];

      const expected: RouteTemplate[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              countriesSelectArgs: mockCountriesSelectArgs,
              decisions: {
                yes: '4',
                no: '5',
                yesAfterComp: '6',
                noAfterComp: '7',
              },
            },
            {
              countriesSelectArgs: mockCountriesSelectArgs,
              decisions: {
                yes: '5',
                no: '8',
                yesAfterComp: '0',
                noAfterComp: '4',
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              countriesSelectArgs: mockCountriesSelectArgs,
              decisions: {
                yes: '1',
                no: '3',
                yesAfterComp: '11',
                noAfterComp: '2',
              },
            },
          ],
        },
      ];

      const i18nService = createMockI18nService();
      const presenter = new DecisionDatasetEditPresenter(routes, i18nService);

      const result = presenter.present();

      expect(result).toEqual(expected);

      expect(CountriesSelectPresenter).toHaveBeenCalledTimes(3);
      expect(CountriesSelectPresenter).nthCalledWith(
        3,
        mockCountries,
        { code: 'FR' },
        i18nService,
      );
      expect(
        CountriesSelectPresenter.prototype.selectArgs,
      ).toHaveBeenCalledTimes(3);

      expect(Country.all).toHaveBeenCalled();

      expect(Country.find).toHaveBeenCalledTimes(2);
      expect(Country.find).toHaveBeenNthCalledWith(1, spotCheckCountryCode);

      expect(decisionValueToStringSpy).toHaveBeenCalledTimes(12);
      expect(decisionValueToStringSpy).nthCalledWith(3, spotCheckValue);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

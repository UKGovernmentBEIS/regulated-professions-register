import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import * as decisionValueToStringModule from '../helpers/decision-value-to-string.helper';
import { RouteTemplate } from '../interfaces/route-template.interface';
import { CountriesSelectPresenter } from './countries-select.presenter';
import { DecisionDatasetEditPresenter } from './decision-dataset-edit.presenter';

jest.mock('./countries-select.presenter');

const mockCountriesSelectArgs: SelectItemArgs[] = [
  {
    text: 'Example country',
    value: 'Example country',
    selected: false,
  },
];

describe('DecisionDatasetEditPresenter', () => {
  describe('when given an array of decision routes', () => {
    it('presents the given decision routes', () => {
      const decisionValueToStringSpy = jest.spyOn(
        decisionValueToStringModule,
        'decisionValueToString',
      );

      (
        CountriesSelectPresenter.prototype.selectArgs as jest.Mock
      ).mockReturnValue(mockCountriesSelectArgs);

      const routes: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              country: 'Example country 1',
              decisions: {
                yes: 4,
                no: 5,
                yesAfterComp: 6,
                noAfterComp: 7,
              },
            },
            {
              country: 'Example country 2',
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
              country: 'Example country 3',
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
        'Example country 3',
        i18nService,
      );
      expect(
        CountriesSelectPresenter.prototype.selectArgs,
      ).toHaveBeenCalledTimes(3);

      expect(decisionValueToStringSpy).toHaveBeenCalledTimes(12);
      expect(decisionValueToStringSpy).nthCalledWith(3, 6);
    });
  });
});

import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import * as decisionValueToStringModule from '../helpers/decision-value-to-string.helper';
import { RouteTemplate } from '../interfaces/route-template.interface';
import { CountrySelectPresenter } from './country-select.presenter';
import { DecisionDatasetEditPresenter } from './decision-dataset-edit.presenter';

jest.mock('./country-select.presenter');

const mockCountrySelectArgs: SelectItemArgs[] = [
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
        CountrySelectPresenter.prototype.selectArgs as jest.Mock
      ).mockReturnValue(mockCountrySelectArgs);

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
              countrySelectArgs: mockCountrySelectArgs,
              decisions: {
                yes: '4',
                no: '5',
                yesAfterComp: '6',
                noAfterComp: '7',
              },
            },
            {
              countrySelectArgs: mockCountrySelectArgs,
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
              countrySelectArgs: mockCountrySelectArgs,
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

      const presenter = new DecisionDatasetEditPresenter(routes);

      const result = presenter.present();

      expect(result).toEqual(expected);

      expect(CountrySelectPresenter).toHaveBeenCalledTimes(3);
      expect(CountrySelectPresenter).nthCalledWith(3, 'Example country 3');
      expect(CountrySelectPresenter.prototype.selectArgs).toHaveBeenCalledTimes(
        3,
      );

      expect(decisionValueToStringSpy).toHaveBeenCalledTimes(12);
      expect(decisionValueToStringSpy).nthCalledWith(3, 6);
    });
  });
});

import { EditDto } from '../dto/edit.dto';
import { parseEditDtoDecisionRoutes } from './parse-edit-dto-decision-routes.helper';
import * as parseDecisionValueModule from './parse-decision-value.helper';
import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { Country } from '../../../countries/country';

jest.mock('../../../countries/country');

describe('parseEditDtoDecisionRoutes', () => {
  describe('when given an empty DTO', () => {
    it('returns an empty list of decision routes', () => {
      expect(parseEditDtoDecisionRoutes({} as EditDto)).toEqual([]);
    });
  });

  describe('when given a populated DTO', () => {
    it('returns a list of decision routes', () => {
      (Country.find as jest.Mock).mockImplementation((code) => ({ code }));

      const parseDecisionValueSpy = jest.spyOn(
        parseDecisionValueModule,
        'parseDecisionValue',
      );

      const spotCheckCountryCode = 'MA';
      const spotCheckValue = '2';

      const editDto: EditDto = {
        routes: ['Example route 1', 'Example route 2', 'Empty route'],
        countries: [
          ['JP', 'CA'],
          [spotCheckCountryCode, 'FR'],
          ['AT', 'ES'],
        ],
        yeses: [
          ['9', '6'],
          ['1', '1'],
          ['', ''],
        ],
        noes: [
          ['', '7'],
          ['3', '4'],
          ['', ''],
        ],
        yesAfterComps: [
          ['5', '9'],
          ['3', ''],
          ['', ''],
        ],
        noAfterComps: [
          [spotCheckValue, '3'],
          ['4', '8'],
          ['', ''],
        ],
        noOtherConditions: [
          ['1', '3'],
          ['4', '8'],
          ['', ''],
        ],
        action: undefined,
      };

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'JP',
              decisions: {
                yes: 9,
                no: 0,
                yesAfterComp: 5,
                noAfterComp: 2,
                noOtherConditions: 1,
              },
            },
            {
              code: 'CA',
              decisions: {
                yes: 6,
                no: 7,
                yesAfterComp: 9,
                noAfterComp: 3,
                noOtherConditions: 3,
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              code: 'MA',
              decisions: {
                yes: 1,
                no: 3,
                yesAfterComp: 3,
                noAfterComp: 4,
                noOtherConditions: 4,
              },
            },
            {
              code: 'FR',
              decisions: {
                yes: 1,
                no: 4,
                yesAfterComp: 0,
                noAfterComp: 8,
                noOtherConditions: 8,
              },
            },
          ],
        },
        {
          name: 'Empty route',
          countries: [
            {
              code: 'AT',
              decisions: {
                yes: null,
                no: null,
                yesAfterComp: null,
                noAfterComp: null,
                noOtherConditions: null,
              },
            },
            {
              code: 'ES',
              decisions: {
                yes: null,
                no: null,
                yesAfterComp: null,
                noAfterComp: null,
                noOtherConditions: null,
              },
            },
          ],
        },
      ];

      expect(parseEditDtoDecisionRoutes(editDto)).toEqual(expected);

      expect(Country.find).toHaveBeenCalledTimes(6);
      expect(Country.find).toHaveBeenNthCalledWith(3, spotCheckCountryCode);

      expect(parseDecisionValueSpy).toHaveBeenCalledTimes(30);
      expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(
        4,
        spotCheckValue,
        true,
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

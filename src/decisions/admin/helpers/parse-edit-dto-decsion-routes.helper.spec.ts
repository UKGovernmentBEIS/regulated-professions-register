import { EditDto } from '../dto/edit.dto';
import { parseEditDtoDecisionRoutes } from './parse-edit-dto-decision-routes.helper';
import * as parseDecisionValueModule from './parse-decision-value.helper';
import { DecisionRoute } from '../../interfaces/decision-route.interface';

describe('parseEditDtoDecisionRoutes', () => {
  describe('when given an empty DTO', () => {
    it('returns an empty list of decision routes', () => {
      expect(parseEditDtoDecisionRoutes({} as EditDto)).toEqual([]);
    });
  });

  describe('when given a populated DTO', () => {
    it('returns a list of decision routes', () => {
      const parseDecisionValueSpy = jest.spyOn(
        parseDecisionValueModule,
        'parseDecisionValue',
      );

      const spotCheckValue = '2';
      const editDto: EditDto = {
        routes: ['Example route 1', 'Example route 2'],
        countries: [
          ['Japan', 'Canada'],
          ['Morocco', 'France'],
        ],
        yeses: [
          ['9', '6'],
          ['1', '1'],
        ],
        noes: [
          ['', '7'],
          ['3', '4'],
        ],
        yesAfterComps: [
          ['5', '9'],
          ['3', '5'],
        ],
        noAfterComps: [
          [spotCheckValue, '3'],
          ['4', '8'],
        ],
        action: undefined,
      };

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              country: 'Japan',
              decisions: {
                yes: 9,
                no: null,
                yesAfterComp: 5,
                noAfterComp: 2,
              },
            },
            {
              country: 'Canada',
              decisions: {
                yes: 6,
                no: 7,
                yesAfterComp: 9,
                noAfterComp: 3,
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              country: 'Morocco',
              decisions: {
                yes: 1,
                no: 3,
                yesAfterComp: 3,
                noAfterComp: 4,
              },
            },
            {
              country: 'France',
              decisions: {
                yes: 1,
                no: 4,
                yesAfterComp: 5,
                noAfterComp: 8,
              },
            },
          ],
        },
      ];

      expect(parseEditDtoDecisionRoutes(editDto)).toEqual(expected);

      expect(parseDecisionValueSpy).toHaveBeenCalledTimes(16);
      expect(parseDecisionValueSpy).toHaveBeenNthCalledWith(4, spotCheckValue);
    });
  });
});

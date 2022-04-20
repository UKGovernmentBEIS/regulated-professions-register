import { DecisionRoute } from '../../interfaces/decision-route.interface';
import { modifyDecisionRoutes } from './modify-decision-routes.helper';

describe('modifyDecisionRoutes', () => {
  describe('when called with "addRoute"', () => {
    it('adds an empty route to the routes array', () => {
      const input: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
        {
          name: '',
          countries: [
            {
              code: null,
              decisions: {
                yes: null,
                no: null,
                yesAfterComp: null,
                noAfterComp: null,
              },
            },
          ],
        },
      ];

      modifyDecisionRoutes(input, 'addRoute');

      expect(input).toEqual(expected);
    });
  });

  describe('when called with "removeRoute"', () => {
    it('adds removes the given route from the routes array', () => {
      const input: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
              },
            },
          ],
        },
      ];

      modifyDecisionRoutes(input, 'removeRoute:2');

      expect(input).toEqual(expected);
    });
  });

  describe('when called with "addCountry"', () => {
    it('adds an empty country to the given route in the routes array', () => {
      const input: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
              },
            },
            {
              code: null,
              decisions: {
                yes: null,
                no: null,
                yesAfterComp: null,
                noAfterComp: null,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      modifyDecisionRoutes(input, 'addCountry:1');

      expect(input).toEqual(expected);
    });
  });

  describe('when called with "removeCountry"', () => {
    it('removes the given country from the given route in the routes array', () => {
      const input: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
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
                yes: 2,
                no: null,
                yesAfterComp: 12,
                noAfterComp: 5,
              },
            },
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      const expected: DecisionRoute[] = [
        {
          name: 'Example route 1',
          countries: [
            {
              code: 'DE',
              decisions: {
                yes: 7,
                no: 4,
                yesAfterComp: null,
                noAfterComp: 11,
              },
            },
            {
              code: 'PL',
              decisions: {
                yes: 3,
                no: 5,
                yesAfterComp: 9,
                noAfterComp: 8,
              },
            },
          ],
        },
        {
          name: 'Example route 2',
          countries: [
            {
              code: 'BE',
              decisions: {
                yes: 2,
                no: 3,
                yesAfterComp: 8,
                noAfterComp: 1,
              },
            },
          ],
        },
      ];

      modifyDecisionRoutes(input, 'removeCountry:2:1');

      expect(input).toEqual(expected);
    });
  });
});

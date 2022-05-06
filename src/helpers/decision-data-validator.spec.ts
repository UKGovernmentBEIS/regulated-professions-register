import { DecisionDataValidator } from './decision-data-validator';

describe('DecisionDataValidator', () => {
  describe('validating no empty routes', () => {
    describe('when there are no empty routes submitted', () => {
      it('returns an empty array of errors', () => {
        const editDto = {
          routes: ['Route 1', 'Route 2'],
          countries: [['CA'], ['AR']],
          yeses: [['1'], ['1']],
          yesAfterComps: [['1'], ['1']],
          noes: [['1'], ['1']],
          noAfterComps: [['1'], ['1']],
          action: 'save',
        };

        const validated = DecisionDataValidator.validate(editDto);

        expect(validated.valid()).toEqual(true);
        expect(validated.errors).toEqual([]);
      });
    });

    describe('when empty routes are submitted', () => {
      it('returns an array of errors', () => {
        const editDto = {
          routes: ['', 'Route 2', ' '],
          countries: [['CA'], ['AR'], ['JP']],
          yeses: [['1'], ['1'], ['1']],
          yesAfterComps: [['1'], ['1'], ['1']],
          noes: [['1'], ['1'], ['1']],
          noAfterComps: [['1'], ['1'], ['1']],
          action: 'save',
        };

        const validated = DecisionDataValidator.validate(editDto);

        expect(validated.valid()).toEqual(false);
        expect(validated.errors).toEqual([
          {
            constraints: {
              message: 'decisions.admin.edit.errors.routes.empty',
            },
            property: 'routes[1]',
          },
          {
            constraints: {
              message: 'decisions.admin.edit.errors.routes.empty',
            },
            property: 'routes[3]',
          },
        ]);
      });
    });
  });
});

import { EditDto } from '../decisions/admin/dto/edit.dto';
import { DecisionDataValidator } from './decision-data-validator';

describe('DecisionDataValidator', () => {
  describe('valid data is submitted', () => {
    it('returns an empty array of errors', () => {
      const editDto: EditDto = {
        routes: ['Route 1', 'Route 2'],
        countries: [['CA'], ['AR']],
        yeses: [['1'], ['1']],
        yesAfterComps: [['1'], ['1']],
        noes: [['1'], ['1']],
        noAfterComps: [['1'], ['1']],
        noOtherConditions: [['1'], ['1']],
        action: 'save',
      };

      const validated = DecisionDataValidator.validate(editDto);

      expect(validated.valid()).toEqual(true);
      expect(validated.errors).toEqual([]);
    });
  });

  describe('when empty routes are submitted', () => {
    it('returns an array of errors, with the empty routes highlighted', () => {
      const editDto: EditDto = {
        routes: ['', 'Route 2', ' '],
        countries: [['CA'], ['AR'], ['JP']],
        yeses: [['1'], ['1'], ['1']],
        yesAfterComps: [['1'], ['1'], ['1']],
        noes: [['1'], ['1'], ['1']],
        noAfterComps: [['1'], ['1'], ['1']],
        noOtherConditions: [['1'], ['1', '1']],
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

  describe('when duplicate routes are submitted', () => {
    it('returns an array of errors, with the duplicate route highlighted', () => {
      const editDto: EditDto = {
        routes: ['Route 1', 'Route 2', 'Route 1'],
        countries: [['CA'], ['AR'], ['JP']],
        yeses: [['1'], ['1'], ['1']],
        yesAfterComps: [['1'], ['1'], ['1']],
        noes: [['1'], ['1'], ['1']],
        noAfterComps: [['1'], ['1'], ['1']],
        noOtherConditions: [['1'], ['1', '1']],
        action: 'save',
      };

      const validated = DecisionDataValidator.validate(editDto);

      expect(validated.valid()).toEqual(false);
      expect(validated.errors).toEqual([
        {
          constraints: {
            message: 'decisions.admin.edit.errors.routes.duplicate',
          },
          property: 'routes[3]',
        },
      ]);
    });
  });

  describe('when empty countries are submitted', () => {
    it('returns an array of errors, with the empty countries highlighted', () => {
      const editDto: EditDto = {
        routes: ['Route 1', 'Route 2'],
        countries: [[''], ['', 'JP']],
        yeses: [['1'], ['1', '1']],
        yesAfterComps: [['1', '1'], ['1']],
        noes: [['1'], ['1', '1']],
        noAfterComps: [['1'], ['1', '1']],
        noOtherConditions: [['1'], ['1', '1']],
        action: 'save',
      };

      const validated = DecisionDataValidator.validate(editDto);

      expect(validated.valid()).toEqual(false);
      expect(validated.errors).toEqual([
        {
          constraints: {
            message: 'decisions.admin.edit.errors.countries.empty',
          },
          property: 'countries[1][1]',
        },
        {
          constraints: {
            message: 'decisions.admin.edit.errors.countries.empty',
          },
          property: 'countries[2][1]',
        },
      ]);
    });
  });

  describe('when duplicate countries are submitted', () => {
    it('returns an array of errors, with the duplicate countries highlighted', () => {
      const editDto: EditDto = {
        routes: ['Route 1', 'Route 2'],
        countries: [['CA'], ['JP', 'JP']],
        yeses: [['1'], ['1', '1']],
        yesAfterComps: [['1', '1'], ['1']],
        noes: [['1'], ['1', '1']],
        noAfterComps: [['1'], ['1', '1']],
        noOtherConditions: [['1'], ['1', '1']],
        action: 'save',
      };

      const validated = DecisionDataValidator.validate(editDto);

      expect(validated.valid()).toEqual(false);
      expect(validated.errors).toEqual([
        {
          constraints: {
            message: 'decisions.admin.edit.errors.countries.duplicate',
          },
          property: 'countries[2][2]',
        },
      ]);
    });
  });
});

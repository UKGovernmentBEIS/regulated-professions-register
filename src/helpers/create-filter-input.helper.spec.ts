import { FilterInput } from '../common/interfaces/filter-input.interface';
import { Nation } from '../nations/nation';
import industryFactory from '../testutils/factories/industry';
import organisationFactory from '../testutils/factories/organisation';
import { createFilterInput } from './create-filter-input.helper';

describe('create-filter-input', () => {
  describe('when given keywords', () => {
    it('returns `FilterInput` with those keywords', () => {
      const result = createFilterInput({ keywords: 'example keywords' });
      const expected: FilterInput = { keywords: 'example keywords' };

      expect(result).toEqual(expected);
    });
  });

  describe('when given nation codes and an array of nations', () => {
    it('returns `FilterInput` with nations of the given codes', () => {
      const nations = Nation.all();

      const result = createFilterInput({
        keywords: '',
        nations: [nations[3].code, nations[2].code],
        allNations: nations,
      });
      const expected: FilterInput = {
        keywords: '',
        nations: [nations[2], nations[3]],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given organisation IDs and an array of organisations', () => {
    it('returns `FilterInput` with organisations of the given IDs', () => {
      const organsiations = organisationFactory.buildList(3);

      const result = createFilterInput({
        keywords: '',
        organisations: [organsiations[2].id, organsiations[1].id],
        allOrganisations: organsiations,
      });
      const expected: FilterInput = {
        keywords: '',
        organisations: [organsiations[1], organsiations[2]],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given industry IDs and an array of industries', () => {
    it('returns `FilterInput` with industries of the given IDs', () => {
      const industries = industryFactory.buildList(3);

      const result = createFilterInput({
        keywords: '',
        industries: [industries[2].id, industries[1].id],
        allIndustries: industries,
      });
      const expected: FilterInput = {
        keywords: '',
        industries: [industries[1], industries[2]],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given a mixture of keywords, nation codes, organisation IDs, and industry IDs', () => {
    it('return `FilterInput` for those keywords, nations, organisations, and industries', () => {
      const nations = Nation.all();
      const organsiations = organisationFactory.buildList(3);
      const industries = industryFactory.buildList(3);

      const result = createFilterInput({
        keywords: 'example keywords',
        nations: [nations[1].code],
        allNations: nations,
        organisations: [
          organsiations[0].id,
          organsiations[2].id,
          organsiations[1].id,
        ],
        allOrganisations: organsiations,
        industries: [industries[0].id],
        allIndustries: industries,
      });

      const expected: FilterInput = {
        keywords: 'example keywords',
        nations: [nations[1]],
        organisations: [organsiations[0], organsiations[1], organsiations[2]],
        industries: [industries[0]],
      };

      expect(result).toEqual(expected);
    });
  });
});

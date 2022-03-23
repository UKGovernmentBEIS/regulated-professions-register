import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { Nation } from '../../nations/nation';
import { RegulationType } from '../../professions/profession-version.entity';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import { hasSelectedFilters } from './has-selected-filters.helper';

describe('hasSelectedFilters', () => {
  describe('when a keyword is entered', () => {
    it('sets hasSelectedFilters to true', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [],
        keywords: 'Example Keywords',
      };

      expect(hasSelectedFilters(filterInput)).toEqual(true);
    });
  });

  describe('when a nation is selected', () => {
    it('sets hasSelectedFilters to true', async () => {
      const filterInput: FilterInput = {
        nations: [{} as Nation],
        industries: [],
        keywords: '',
      };

      expect(hasSelectedFilters(filterInput)).toEqual(true);
    });
  });

  describe('when an industry is selected', () => {
    it('sets hasSelectedFilters to true', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [industryFactory.build()],
        keywords: '',
        organisations: undefined,
        regulationTypes: undefined,
      };

      expect(hasSelectedFilters(filterInput)).toEqual(true);
    });
  });

  describe('when an organisation is selected', () => {
    it('sets hasSelectedFilters to true', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [],
        keywords: '',
        organisations: [organisationFactory.build()],
        regulationTypes: undefined,
      };

      expect(hasSelectedFilters(filterInput)).toEqual(true);
    });
  });

  describe('when a regulation type is selected', () => {
    it('sets hasSelectedFilters to true', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [],
        keywords: '',
        organisations: undefined,
        regulationTypes: [RegulationType.Licensing],
      };

      expect(hasSelectedFilters(filterInput)).toEqual(true);
    });
  });

  describe('when no filters are selected', () => {
    it('sets hasSelectedFilters to false', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [],
        keywords: '',
        organisations: undefined,
        regulationTypes: undefined,
      };

      expect(hasSelectedFilters(filterInput)).toEqual(false);
    });
  });
});

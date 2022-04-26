import { FilterInput } from '../common/interfaces/filter-input.interface';
import { DecisionDatasetStatus } from '../decisions/decision-dataset.entity';
import { Nation } from '../nations/nation';
import { RegulationType } from '../professions/profession-version.entity';
import industryFactory from '../testutils/factories/industry';
import organisationFactory from '../testutils/factories/organisation';
import { createFilterInput } from './create-filter-input.helper';

describe('createFilterInput', () => {
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

  describe('when given regulation types', () => {
    it('returns `FilterInput` with the given regulation types', () => {
      const result = createFilterInput({
        keywords: '',
        regulationTypes: [
          RegulationType.Certification,
          RegulationType.Licensing,
        ],
      });
      const expected: FilterInput = {
        keywords: '',
        regulationTypes: [
          RegulationType.Certification,
          RegulationType.Licensing,
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given years', () => {
    it('returns `FilterInput` with the given years', () => {
      const result = createFilterInput({
        keywords: '',
        years: ['2020', '2021'],
      });
      const expected: FilterInput = {
        keywords: '',
        years: [2020, 2021],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given decision dataset statuses', () => {
    it('returns `FilterInput` with the given statuses', () => {
      const result = createFilterInput({
        keywords: '',
        statuses: [DecisionDatasetStatus.Draft, DecisionDatasetStatus.Live],
      });
      const expected: FilterInput = {
        keywords: '',
        statuses: [DecisionDatasetStatus.Draft, DecisionDatasetStatus.Live],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when given a mixture of keywords, nation codes, organisation IDs, industry IDs, regulation types, years, and decision dataset statuses', () => {
    it('returns `FilterInput` for those keywords, nations, organisations, industries, regulation types, years, and decision dataset statuses', () => {
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
        regulationTypes: [RegulationType.Licensing],
        years: ['2021', '2022'],
        statuses: [DecisionDatasetStatus.Draft],
      });

      const expected: FilterInput = {
        keywords: 'example keywords',
        nations: [nations[1]],
        organisations: [organsiations[0], organsiations[1], organsiations[2]],
        industries: [industries[0]],
        regulationTypes: [RegulationType.Licensing],
        years: [2021, 2022],
        statuses: [DecisionDatasetStatus.Draft],
      };

      expect(result).toEqual(expected);
    });
  });
});

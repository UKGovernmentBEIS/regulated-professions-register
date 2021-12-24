import { Industry } from '../../industries/industry.entity';
import { FilterHelper } from './filter.helper';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { Nation } from '../../nations/nation';
import { Profession } from '../profession.entity';

describe('FilterHelper', () => {
  describe('filter', () => {
    it('returns all professions when given an empty filter input', () => {
      const exampleProfessions = [
        createProfession('Example 1', ['GB-ENG'], ['education', 'law']),
        createProfession('Example 2', ['GB-SCT'], ['construction']),
        createProfession(
          'Example 3',
          ['GB-WLS', 'GB-NIR'],
          ['education', 'finance'],
        ),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({});

      expect(results).toEqual(exampleProfessions);
    });

    it('returns all professions when individual filter criteria are empty', () => {
      const exampleProfessions = [
        createProfession('Example 1', ['GB-WLS'], ['law', 'other']),
        createProfession('Example 2', ['GB-NIR', 'GB-ENG'], ['health']),
        createProfession('Example 3', ['GB-SCT'], ['security']),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: '',
        nations: [],
        organisations: [],
        industries: [],
        changedBy: [],
      });

      expect(results).toEqual(exampleProfessions);
    });

    it('can filter professions by keywords', () => {
      const exampleProfessions = [
        professionFactory.build({ name: 'Trademark Attorny' }),
        professionFactory.build({ name: 'Chartered Accountant' }),
        professionFactory.build({ name: 'Secondary School Teacher' }),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        // Test a complete and incomplete word match
        keywords: 'Attorny    condar',
      });

      expect(results).toEqual([exampleProfessions[0], exampleProfessions[2]]);
    });

    it('keywords are case insensitive', () => {
      const exampleProfessions = [
        professionFactory.build({ name: 'Trademark Attorny' }),
        professionFactory.build({ name: 'Chartered Accountant' }),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: 'aTtOrNy',
      });

      expect(results).toEqual([exampleProfessions[0]]);
    });

    it('can filter professions by nations', () => {
      const exampleProfessions = [
        createProfessionWithNations('GB-NIR'),
        createProfessionWithNations('GB-NIR', 'GB-SCT'),
        createProfessionWithNations('GB-WLS'),
        createProfessionWithNations('GB-ENG'),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        nations: [
          new Nation('nations.england', 'GB-ENG'),
          new Nation('nations.northernIreland', 'GB-NIR'),
        ],
      });

      expect(results).toEqual([
        exampleProfessions[0],
        exampleProfessions[1],
        exampleProfessions[3],
      ]);
    });

    it('can filter professions by industry', () => {
      const exampleProfessions = [
        createProfessionWithIndustries('finance'),
        createProfessionWithIndustries('health'),
        createProfessionWithIndustries('law'),
        createProfessionWithIndustries('law', 'education'),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        industries: [
          createIndustryWithId('education'),
          createIndustryWithId('finance'),
        ],
      });

      expect(results).toEqual([exampleProfessions[0], exampleProfessions[3]]);
    });

    it('can filter by multiple criteria', () => {
      const exampleProfessions = [
        // Won't match on nation
        createProfession('Secondary School Teacher', ['GB-SCT'], ['education']),
        // Won't match on industry
        createProfession('Bricklaying Teacher', ['GB-NIR'], ['construction']),
        // Won't match on keyword
        createProfession(
          'Leagal Training Facilitator',
          ['GB-WLS', 'GB-NIR'],
          ['education', 'law'],
        ),
        // Will match on all
        createProfession(
          'Primary School Teacher',
          ['GB-NIR', 'GB-ENG'],
          ['education'],
        ),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: 'Teacher',
        industries: [createIndustryWithId('education')],
        nations: [new Nation('nations.northernIreland', 'GB-NIR')],
      });

      expect(results).toEqual([exampleProfessions[3]]);
    });
  });
});

function createProfessionWithNations(...nationCodes: string[]): Profession {
  return professionFactory.build({ occupationLocations: nationCodes });
}

function createProfessionWithIndustries(...industryIds: string[]): Profession {
  return professionFactory.build({
    industries: industryIds.map((name) => createIndustryWithId(name)),
  });
}

function createProfession(
  name: string,
  nationCodes: string[],
  industryNames: string[],
): Profession {
  const industries = industryNames.map((name) => createIndustryWithId(name));

  return professionFactory.build({
    name,
    industries,
    occupationLocations: nationCodes,
  });
}

function createIndustryWithId(id: string): Industry {
  return industryFactory.build({ id });
}

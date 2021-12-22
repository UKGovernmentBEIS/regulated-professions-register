import { randomUUID } from 'crypto';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { Profession } from '../../../professions/profession.entity';
import { FilterHelper } from './filter.helper';

describe('FilterHelper', () => {
  describe('filter', () => {
    it('returns all professions when given an empty filter', () => {
      const exampleProfessions = [
        createProfession('Example 1', ['GB-ENG'], ['education', 'law']),
        createProfession('Example 1', ['GB-SCT'], ['construction']),
        createProfession(
          'Example 3',
          ['GB-WLS', 'GB-NIR'],
          ['education', 'finance'],
        ),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: '',
        industries: [],
        nations: [],
      });

      expect(results).toEqual(exampleProfessions);
    });

    it('can filter professions by keywords', () => {
      const exampleProfessions = [
        new Profession('Trademark Attorny'),
        new Profession('Chartered Accountant'),
        new Profession('Secondary School Teacher'),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        // Test a complete and incomplete word match
        keywords: 'Attorny    condar',
        industries: [],
        nations: [],
      });

      expect(results).toEqual([exampleProfessions[0], exampleProfessions[2]]);
    });

    it('keywords are case insensitive', () => {
      const exampleProfessions = [
        new Profession('Trademark Attorny'),
        new Profession('Chartered Accountant'),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: 'aTtOrNy',
        industries: [],
        nations: [],
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
        keywords: '',
        industries: [],
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
        keywords: '',
        industries: [
          createIndustryWithId('education'),
          createIndustryWithId('finance'),
        ],
        nations: [],
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
  const profession = new Profession(randomUUID());
  profession.occupationLocations = nationCodes;

  return profession;
}

function createProfessionWithIndustries(
  ...industryNames: string[]
): Profession {
  const profession = new Profession(randomUUID());
  const industries = industryNames.map((name) => createIndustryWithId(name));

  profession.industries = industries;

  return profession;
}

function createProfession(
  name: string,
  nationCodes: string[],
  industryNames: string[],
): Profession {
  const profession = new Profession(name);
  const industries = industryNames.map((name) => createIndustryWithId(name));

  profession.occupationLocations = nationCodes;
  profession.industries = industries;

  return profession;
}

function createIndustryWithId(industryId: string): Industry {
  const industry = new Industry(industryId);
  industry.id = industryId;

  return industry;
}

import { randomUUID } from 'crypto';
import { Industry } from '../../industries/industry.entity';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';
import { FilterHelper } from './filter.helper';

describe('FilterHelper', () => {
  describe('filter', () => {
    it('returns all professions when given an empty filter input', () => {
      const exampleProfessions = [
        createProfession('Example 1', ['GB-ENG'], 'general-medical-council', [
          'education',
          'law',
        ]),
        createProfession('Example 2', ['GB-SCT'], 'law-society', [
          'construction',
        ]),
        createProfession(
          'Example 3',
          ['GB-WLS', 'GB-NIR'],
          'department-for-education',
          ['education', 'finance'],
        ),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({});

      expect(results).toEqual(exampleProfessions);
    });

    it('returns all professions when individual filter criteria are empty', () => {
      const exampleProfessions = [
        createProfession('Example 1', ['GB-WLS'], 'general-medical-council', [
          'law',
          'other',
        ]),
        createProfession(
          'Example 2',
          ['GB-NIR', 'GB-ENG'],
          'department-for-education',
          ['health'],
        ),
        createProfession('Example 3', ['GB-SCT'], 'law-society', ['security']),
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
        new Profession('Trademark Attorny'),
        new Profession('Chartered Accountant'),
        new Profession('Secondary School Teacher'),
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
        new Profession('Trademark Attorny'),
        new Profession('Chartered Accountant'),
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

    it('can filter professions by organisation', () => {
      const exampleProfessions = [
        createProfessionWithOrganisation('law-society'),
        createProfessionWithOrganisation('department-for-education'),
        createProfessionWithOrganisation('general-medical-council'),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        organisations: [
          createOrganisationWithId('general-medical-council'),
          createOrganisationWithId('department-for-education'),
        ],
      });

      expect(results).toEqual([exampleProfessions[1], exampleProfessions[2]]);
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
        createProfession(
          'Secondary School Teacher',
          ['GB-SCT'],
          'department-for-education',
          ['education'],
        ),
        // Won't match on organisation
        createProfession(
          'Dentistry Teacher',
          ['GB-NIR'],
          'general-medical-council',
          ['education', 'medical'],
        ),
        // Won't match on industry
        createProfession(
          'Bricklaying Teacher',
          ['GB-NIR'],
          'department-for-education',
          ['construction'],
        ),
        // Won't match on keyword
        createProfession(
          'Leagal Training Facilitator',
          ['GB-WLS', 'GB-NIR'],
          'department-for-education',
          ['education', 'law'],
        ),
        // Will match on all
        createProfession(
          'Primary School Teacher',
          ['GB-NIR', 'GB-ENG'],
          'department-for-education',
          ['education'],
        ),
      ];

      const filterHelper = new FilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: 'Teacher',
        organisations: [createOrganisationWithId('department-for-education')],
        industries: [createIndustryWithId('education')],
        nations: [new Nation('nations.northernIreland', 'GB-NIR')],
      });

      expect(results).toEqual([exampleProfessions[4]]);
    });
  });
});

function createProfessionWithNations(...nationCodes: string[]): Profession {
  const profession = new Profession(randomUUID());
  profession.occupationLocations = nationCodes;

  return profession;
}

function createProfessionWithOrganisation(organisationId: string): Profession {
  const profession = new Profession(randomUUID());
  profession.organisation = createOrganisationWithId(organisationId);

  return profession;
}

function createProfessionWithIndustries(...industryIds: string[]): Profession {
  const profession = new Profession(randomUUID());
  const industries = industryIds.map((name) => createIndustryWithId(name));

  profession.industries = industries;

  return profession;
}

function createProfession(
  name: string,
  nationCodes: string[],
  organisation: string,
  industryNames: string[],
): Profession {
  const profession = new Profession(name);
  const industries = industryNames.map((name) => createIndustryWithId(name));

  profession.occupationLocations = nationCodes;
  profession.organisation = createOrganisationWithId(organisation);
  profession.industries = industries;

  return profession;
}

function createIndustryWithId(industryId: string): Industry {
  const industry = new Industry(industryId);
  industry.id = industryId;

  return industry;
}

function createOrganisationWithId(organisationId: string): Organisation {
  const organisation = new Organisation(organisationId);
  organisation.id = organisationId;

  return organisation;
}

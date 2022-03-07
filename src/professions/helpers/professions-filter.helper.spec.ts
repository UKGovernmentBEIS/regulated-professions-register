import { Industry } from '../../industries/industry.entity';
import { ProfessionsFilterHelper } from './professions-filter.helper';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../profession.entity';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import organisationFactory from '../../testutils/factories/organisation';
import * as getOrganisationsFromProfessionModule from './get-organisations-from-profession.helper';

describe('ProfessionsFilterHelper', () => {
  describe('filter', () => {
    it('returns successfully when a profession has undefined fields', () => {
      const filterHelper = new ProfessionsFilterHelper([
        professionFactory.build({
          name: undefined,
          occupationLocations: undefined,
          organisation: undefined,
          industries: undefined,
        }),
      ]);

      expect(
        filterHelper.filter({
          keywords: 'dentist',
          nations: [Nation.find('GB-NIR')],
          organisations: [organisationFactory.build()],
          industries: [industryFactory.build()],
        }),
      ).toEqual([]);
    });

    it('can filter professions by keywords', () => {
      const exampleProfessions = [
        professionFactory.build({ name: 'Trademark Attorny' }),
        professionFactory.build({ name: 'Chartered Accountant' }),
        professionFactory.build({ name: 'Secondary School Teacher' }),
      ];

      const filterHelper = new ProfessionsFilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        keywords: 'School',
      });

      expect(results).toEqual([exampleProfessions[2]]);
    });

    it('can filter professions by nations', () => {
      const exampleProfessions = [
        createProfessionWithNations('GB-NIR'),
        createProfessionWithNations('GB-NIR', 'GB-SCT'),
        createProfessionWithNations('GB-WLS'),
        createProfessionWithNations('GB-ENG'),
      ];

      const filterHelper = new ProfessionsFilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        nations: [Nation.find('GB-ENG'), Nation.find('GB-NIR')],
      });

      expect(results).toEqual([
        exampleProfessions[0],
        exampleProfessions[1],
        exampleProfessions[3],
      ]);
    });

    it('can filter professions by organisation', () => {
      const exampleProfessions = [
        createProfessionWithOrganisations('law-society'),
        createProfessionWithOrganisations('department-for-education'),
        createProfessionWithOrganisations('general-medical-council'),
        createProfessionWithOrganisations(
          'law-society',
          'alternative-law-society',
        ),
      ];

      const filterHelper = new ProfessionsFilterHelper(exampleProfessions);

      const getOrganisationsFromProfessionSpy = jest.spyOn(
        getOrganisationsFromProfessionModule,
        'getOrganisationsFromProfession',
      );

      const results = filterHelper.filter({
        organisations: [
          createOrganisationWithId('general-medical-council'),
          createOrganisationWithId('department-for-education'),
          createOrganisationWithId('alternative-law-society'),
        ],
      });

      expect(results).toEqual([
        exampleProfessions[1],
        exampleProfessions[2],
        exampleProfessions[3],
      ]);
      expect(getOrganisationsFromProfessionSpy).toBeCalledTimes(4);
    });

    it('can filter professions by industry', () => {
      const exampleProfessions = [
        createProfessionWithIndustries('finance'),
        createProfessionWithIndustries('health'),
        createProfessionWithIndustries('law'),
        createProfessionWithIndustries('law', 'education'),
      ];

      const filterHelper = new ProfessionsFilterHelper(exampleProfessions);

      const results = filterHelper.filter({
        industries: [
          createIndustryWithId('education'),
          createIndustryWithId('finance'),
        ],
      });

      expect(results).toEqual([exampleProfessions[0], exampleProfessions[3]]);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

function createProfessionWithNations(...nationCodes: string[]): Profession {
  return professionFactory.build({ occupationLocations: nationCodes });
}

function createProfessionWithOrganisations(
  organisationId: string,
  additionalOrganisation: string = undefined,
): Profession {
  return professionFactory.build({
    organisation: organisationFactory.build({ id: organisationId }),
    additionalOrganisation:
      additionalOrganisation &&
      organisationFactory.build({ id: additionalOrganisation }),
  });
}

function createProfessionWithIndustries(...industryIds: string[]): Profession {
  return professionFactory.build({
    industries: industryIds.map((name) => createIndustryWithId(name)),
  });
}

function createIndustryWithId(id: string): Industry {
  return industryFactory.build({ id });
}

function createOrganisationWithId(id: string): Organisation {
  return organisationFactory.build({ id });
}

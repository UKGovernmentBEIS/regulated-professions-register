import { Nation } from '../../nations/nation';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import organisationFactory from '../../testutils/factories/organisation';
import { OrganisationsFilterHelper } from './organisations-filter.helper';

describe('OrganisationsFilterHelper', () => {
  describe('filter', () => {
    it('can filter professions by keywords', () => {
      const organisations = [
        organisationFactory.build({ name: 'General Medical Council' }),
        organisationFactory.build({ name: 'Department for Education' }),
        organisationFactory.build({ name: 'Law Society of England and Wales' }),
      ];

      const filterHelper = new OrganisationsFilterHelper(organisations);

      const results = filterHelper.filter({
        keywords: 'Society',
      });

      expect(results).toEqual([organisations[2]]);
    });

    it('can filter organisations by nations', () => {
      const organisations = [
        // Has no professions with matching nations
        organisationFactory.build({
          professions: [
            professionFactory.build({ occupationLocations: ['GB-NIR'] }),
          ],
        }),
        // Has one matching and one non-matching profession
        organisationFactory.build({
          professions: [
            professionFactory.build({ occupationLocations: ['GB-WLS'] }),
            professionFactory.build({
              occupationLocations: ['GB-SCT', 'GB-ENG'],
            }),
          ],
        }),
        // Has one matching profession
        organisationFactory.build({
          professions: [
            professionFactory.build({ occupationLocations: ['GB-SCT'] }),
          ],
        }),
      ];

      const filterHelper = new OrganisationsFilterHelper(organisations);

      const results = filterHelper.filter({
        nations: [Nation.find('GB-SCT')],
      });

      expect(results).toEqual([organisations[1], organisations[2]]);
    });

    it('can filter professions by industry', () => {
      const matchingIndustry = industryFactory.build();

      const organisations = [
        // Has one matching and one non-matching profession
        organisationFactory.build({
          professions: [
            professionFactory.build({
              industries: [
                industryFactory.build(),
                industryFactory.build({ id: matchingIndustry.id }),
              ],
            }),
            professionFactory.build({ industries: [industryFactory.build()] }),
          ],
        }),
        // Has one matching profession
        organisationFactory.build({
          professions: [
            professionFactory.build({
              industries: [industryFactory.build({ id: matchingIndustry.id })],
            }),
          ],
        }),
        // Has no professions with matching industries
        organisationFactory.build({
          professions: [
            professionFactory.build({ industries: [industryFactory.build()] }),
          ],
        }),
      ];

      const filterHelper = new OrganisationsFilterHelper(organisations);

      const results = filterHelper.filter({
        industries: [industryFactory.build({ id: matchingIndustry.id })],
      });

      expect(results).toEqual([organisations[0], organisations[1]]);
    });

    describe('when the professions relation is not loaded', () => {
      let filterHelper: OrganisationsFilterHelper;

      beforeEach(() => {
        const organisations = [
          organisationFactory.build({
            professions: undefined,
          }),
        ];

        filterHelper = new OrganisationsFilterHelper(organisations);
      });

      it('filtering by nation raises an error', () => {
        expect(() => {
          filterHelper.filter({ nations: [Nation.find('GB-WLS')] });
        }).toThrowError(
          'You must eagerly load professions to filter by nations. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      });

      it('filtering by industry raises an error', () => {
        expect(() => {
          filterHelper.filter({ industries: [industryFactory.build()] });
        }).toThrowError(
          'You must eagerly load professions to filter by industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      });
    });

    describe('when the industries relation is not loaded', () => {
      let filterHelper: OrganisationsFilterHelper;

      beforeEach(() => {
        const organisations = [
          organisationFactory.build({
            professions: [professionFactory.build({ industries: undefined })],
          }),
        ];

        filterHelper = new OrganisationsFilterHelper(organisations);
      });

      it('filtering by industry raises an error', () => {
        expect(() => {
          filterHelper.filter({ industries: [industryFactory.build()] });
        }).toThrowError(
          'You must eagerly load industries to filter by industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      });
    });
  });
});

import { Nation } from '../../nations/nation';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import organisationFactory from '../../testutils/factories/organisation';
import { OrganisationsFilterHelper } from './organisations-filter.helper';
import { Organisation } from '../organisation.entity';
import { Profession } from '../../professions/profession.entity';

describe('OrganisationsFilterHelper', () => {
  describe('filter', () => {
    it('it returns successfully when an organisation has undefined fields', () => {
      const filterHelper = new OrganisationsFilterHelper([
        new Organisation(),
        organisationFactory.build({ professions: [new Profession()] }),
      ]);

      expect(
        filterHelper.filter({
          keywords: 'medical',
          nations: [Nation.find('GB-SCT')],
          industries: [industryFactory.build()],
        }),
      ).toEqual([]);
    });

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
  });
});

import organisationFactory from '../../testutils/factories/organisation';
import { OrganisationSearchResultPresenter } from './organisation-search-result.presenter';

describe('OrganisationSearchResultPresenter', () => {
  describe('present', () => {
    it('Returns a OrganisationSearchResultTemplate', async () => {
      const organisation = organisationFactory.build({
        name: 'Example Organisation',
        slug: 'example-organisation',
      });

      const result = await new OrganisationSearchResultPresenter(
        organisation,
      ).present();

      expect(result).toEqual({
        name: 'Example Organisation',
        slug: 'example-organisation',
      });
    });
  });
});

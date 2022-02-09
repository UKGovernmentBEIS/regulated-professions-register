import { OrganisationsCheckboxPresenter } from './organisations-checkbox-presenter';
import organisationFactory from '../testutils/factories/organisation';

const organisation1 = organisationFactory.build({
  id: 'example-organisation-1',
  name: 'Example Organisation 1',
});
const organisation2 = organisationFactory.build({
  id: 'example-organisation-2',
  name: 'Example Organisation 2',
});
const organisation3 = organisationFactory.build({
  id: 'example-organisation-3',
  name: 'Example Organisation 3',
});

const organisations = [organisation1, organisation2, organisation3];

describe('OrganisationsCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    it('should return unchecked checkbox arguments when called with an empty list of Organisations', () => {
      const presenter = new OrganisationsCheckboxPresenter(organisations, []);

      expect(presenter.checkboxItems()).toEqual([
        {
          text: 'Example Organisation 1',
          value: 'example-organisation-1',
          checked: false,
        },
        {
          text: 'Example Organisation 2',
          value: 'example-organisation-2',
          checked: false,
        },
        {
          text: 'Example Organisation 3',
          value: 'example-organisation-3',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of Organisations', async () => {
      const presenter = new OrganisationsCheckboxPresenter(organisations, [
        organisation3,
        organisation1,
      ]);

      expect(presenter.checkboxItems()).toEqual([
        {
          text: 'Example Organisation 1',
          value: 'example-organisation-1',
          checked: true,
        },
        {
          text: 'Example Organisation 2',
          value: 'example-organisation-2',
          checked: false,
        },
        {
          text: 'Example Organisation 3',
          value: 'example-organisation-3',
          checked: true,
        },
      ]);
    });
  });
});

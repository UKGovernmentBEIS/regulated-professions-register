import { OrganisationsPresenter } from './organisations-presenter';
import { escape } from '../../../helpers/escape.helper';
import { escapeOf } from '../../../testutils/escape-of';
import organisationFactory from '../../../testutils/factories/organisation';

jest.mock('../../../helpers/escape.helper');

describe('OrganisationsPresenter', () => {
  describe('list', () => {
    it('should return a list of organisations', () => {
      const organisation1 = organisationFactory.build({ name: 'org1' });
      const organisation2 = organisationFactory.build({ name: 'org2' });

      (escape as jest.Mock).mockImplementation(escapeOf);

      const presenter = new OrganisationsPresenter([
        organisation1,
        organisation2,
      ]);

      expect(presenter.list()).toEqual(
        `<p class="govuk-body">${escapeOf('org1')}<br/>${escapeOf('org2')}</p>`,
      );
    });

    it('should return an empty string if there are no organisations', () => {
      const presenter = new OrganisationsPresenter(undefined);

      expect(presenter.list()).toEqual('');
    });
  });
});

import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { getUserOrganisation } from './get-user-organisation';

describe('getUserOrganisation', () => {
  describe('when the user is a service owner', () => {
    it('returns the BEIS team translation string', () => {
      const user = userFactory.build({ serviceOwner: true });

      expect(getUserOrganisation(user)).toEqual('app.beis');
    });
  });

  describe('when the user is not a service owner', () => {
    it('returns the BEIS team translation string', () => {
      const user = userFactory.build({
        serviceOwner: false,
        organisation: organisationFactory.build({
          name: 'Department for Education',
        }),
      });

      expect(getUserOrganisation(user)).toEqual('Department for Education');
    });
  });
});

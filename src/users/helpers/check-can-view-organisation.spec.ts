import { UnauthorizedException } from '@nestjs/common';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { checkCanViewOrganisation } from './check-can-view-organisation';
import { getActingUser } from './get-acting-user.helper';

jest.mock('./get-acting-user.helper');

describe('checkCanViewOrganisation', () => {
  describe('when called with a request from a non-service owner user', () => {
    describe('when trying to view data from the same organisation', () => {
      it('returns without throwing an Error', () => {
        const organisation = organisationFactory.build();
        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisation,
        });

        (getActingUser as jest.Mock).mockReturnValue(user);

        const request = createDefaultMockRequest({ user: user });

        expect(() => {
          checkCanViewOrganisation(request, organisation);
        }).not.toThrowError();
      });
    });

    describe('when trying to view data from a different organisation', () => {
      it('throws an UnauthorisedException', () => {
        const userOrganisation = organisationFactory.build();
        const user = userFactory.build({
          serviceOwner: false,
          organisation: userOrganisation,
        });
        const otherOrganisation = organisationFactory.build();

        (getActingUser as jest.Mock).mockReturnValue(user);

        const request = createDefaultMockRequest({ user: user });

        expect(() => {
          checkCanViewOrganisation(request, otherOrganisation);
        }).toThrowError(UnauthorizedException);
      });
    });

    describe('when trying to view data with no organisation passed in e.g. for a service owner', () => {
      it('throws an UnauthorisedException', () => {
        const userOrganisation = organisationFactory.build();
        const user = userFactory.build({
          serviceOwner: false,
          organisation: userOrganisation,
        });

        (getActingUser as jest.Mock).mockReturnValue(user);

        const request = createDefaultMockRequest({ user: user });

        expect(() => {
          checkCanViewOrganisation(request, null);
        }).toThrowError(UnauthorizedException);
      });
    });
  });

  describe('when called as a service owner user', () => {
    it('returns without throwing an Error', () => {
      const user = userFactory.build({ serviceOwner: true });
      const otherOrganisation = organisationFactory.build();

      (getActingUser as jest.Mock).mockReturnValue(user);

      const request = createDefaultMockRequest({ user: user });

      expect(() => {
        checkCanViewOrganisation(request, otherOrganisation);
      }).not.toThrowError();
    });

    describe('when trying to view data with no organisation passed in e.g. for a service owner', () => {
      it('returns true without throwing an Error', () => {
        const user = userFactory.build({
          serviceOwner: true,
          organisation: null,
        });

        (getActingUser as jest.Mock).mockReturnValue(user);

        const request = createDefaultMockRequest({ user: user });

        expect(() => {
          checkCanViewOrganisation(request, null);
        }).not.toThrowError(UnauthorizedException);
      });
    });
  });
});

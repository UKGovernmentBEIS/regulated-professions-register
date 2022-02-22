import { UnauthorizedException } from '@nestjs/common';
import userFactory from '../../testutils/factories/user';
import { checkUserIsServiceOwner } from './check-user-is-service-owner.helper';

describe('checkUserIsServiceOwner', () => {
  describe('when called with a non-service owner user', () => {
    it('throws an UnauthorisedException', () => {
      const user = userFactory.build({ serviceOwner: false });

      expect(() => {
        checkUserIsServiceOwner(user);
      }).toThrowError(UnauthorizedException);
    });
  });

  describe('when called a service owner user', () => {
    it('returns without throwing an Error', () => {
      const user = userFactory.build({ serviceOwner: true });

      expect(() => {
        checkUserIsServiceOwner(user);
      }).not.toThrowError();
    });
  });
});

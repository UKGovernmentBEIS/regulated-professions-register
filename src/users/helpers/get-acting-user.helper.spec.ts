import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { getActingUser } from './get-acting-user.helper';

describe('getActingUser', () => {
  describe('when called with an Request from a non-logged in user', () => {
    it('returns undefined', () => {
      const request = createDefaultMockRequest();

      expect(getActingUser(request)).toEqual(undefined);
    });
  });

  describe('when called with an Request from a logged in user', () => {
    it('returns that user', () => {
      const user = userFactory.build();
      const request = createDefaultMockRequest({ user });

      expect(getActingUser(request)).toEqual(user);
    });
  });
});

import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import professionFactory from '../../testutils/factories/profession';
import { checkCanChangeProfession } from './check-can-change-profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from './get-acting-user.helper';
import * as canChangeProfessionModule from './can-change-profession';
import { UnauthorizedException } from '@nestjs/common';

describe('checkCanChangeProfession', () => {
  describe('when canChangeProfession returns true', () => {
    it('returns without throwing an Error', () => {
      const getActingUserSpy = jest.spyOn(getActingUserModule, 'getActingUser');
      const canChangeProfessionModuleSpy = jest.spyOn(
        canChangeProfessionModule,
        'canChangeProfession',
      );

      const user = userFactory.build({ serviceOwner: true });
      const profession = professionFactory.build();

      getActingUserSpy.mockReturnValue(user);
      canChangeProfessionModuleSpy.mockReturnValue(true);

      const request = createDefaultMockRequest({ user });

      expect(() => {
        checkCanChangeProfession(request, profession);
      }).not.toThrowError();

      expect(getActingUserSpy).toBeCalledWith(request);
    });
  });

  describe('when canChangeProfession returns false', () => {
    it('throws an UnauthorizedException', () => {
      const getActingUserSpy = jest.spyOn(getActingUserModule, 'getActingUser');
      const canChangeProfessionModuleSpy = jest.spyOn(
        canChangeProfessionModule,
        'canChangeProfession',
      );

      const user = userFactory.build({ serviceOwner: true });
      const profession = professionFactory.build();

      getActingUserSpy.mockReturnValue(user);
      canChangeProfessionModuleSpy.mockReturnValue(false);

      const request = createDefaultMockRequest({ user });

      expect(() => {
        checkCanChangeProfession(request, profession);
      }).toThrowError(UnauthorizedException);

      expect(getActingUserSpy).toBeCalledWith(request);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { createDefaultMockRequest } from '../../../testutils/factories/create-default-mock-request';
import userFactory from '../../../testutils/factories/user';
import * as getActingUserModule from '../../../users/helpers/get-acting-user.helper';
import * as getPermissionsFromUserModule from '../../../users/helpers/get-permissions-from-user.helper';
import { UserPermission } from '../../../users/user-permission';
import { checkCanPublishDataset } from './check-can-publish-dataset.helper';

describe('checkCanPublishDataset', () => {
  describe('when the user has `PublishDecisionData` as one of their permissions', () => {
    it('returns without throwing an error', () => {
      const user = userFactory.build();
      const request = createDefaultMockRequest({ user });

      const getActingUserSpy = jest
        .spyOn(getActingUserModule, 'getActingUser')
        .mockReturnValue(user);

      const getPermissionsFromUser = jest
        .spyOn(getPermissionsFromUserModule, 'getPermissionsFromUser')
        .mockReturnValue([UserPermission.PublishDecisionData]);

      expect(() => checkCanPublishDataset(request)).not.toThrowError();

      expect(getActingUserSpy).toHaveBeenCalledWith(request);
      expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
    });
  });

  describe('when the user does not have `PublishDecisionData` as one of their permissions', () => {
    it('throws an UnauthorizedException', () => {
      const user = userFactory.build();
      const request = createDefaultMockRequest({ user });

      const getActingUserSpy = jest
        .spyOn(getActingUserModule, 'getActingUser')
        .mockReturnValue(user);

      const getPermissionsFromUser = jest
        .spyOn(getPermissionsFromUserModule, 'getPermissionsFromUser')
        .mockReturnValue([]);

      expect(() => checkCanPublishDataset(request)).toThrow(
        UnauthorizedException,
      );

      expect(getActingUserSpy).toHaveBeenCalledWith(request);
      expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
    });
  });
});

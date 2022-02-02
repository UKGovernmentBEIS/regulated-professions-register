import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';
import { User } from '../users/user.entity';
import userFactory from '../testutils/factories/user';
import { UserPermission } from '../users/user-permission';
import { getPermissionsFromUser } from '../users/helpers/get-permissions-from-user.helper';

jest.mock('../users/helpers/get-permissions-from-user.helper');

beforeEach(() => {
  (getPermissionsFromUser as jest.Mock).mockReset();
});

let host: ExecutionContext;
let reflector: Reflector;

describe('AuthenticationGuard', () => {
  describe('when isAuthenticated() is true', () => {
    it('should return true', () => {
      createEnvironment(createOidc(true));

      const guard = new AuthenticationGuard(reflector);

      expect(guard.canActivate(host)).toStrictEqual(true);
    });

    describe('when permissions are specified', () => {
      it('should return true when the user has the appropriate permission', () => {
        const user = userFactory.build();
        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateUser,
        ]);

        createEnvironment(createOidc(true), [UserPermission.CreateUser], user);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(true);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });

      it('should return false when the user does not have the appropriate permission', () => {
        const user = userFactory.build();
        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateOrganisation,
        ]);

        createEnvironment(createOidc(true), [UserPermission.CreateUser], user);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });

      it('should return false when the user has no permissions', () => {
        const user = userFactory.build();
        (getPermissionsFromUser as jest.Mock).mockReturnValue([]);

        createEnvironment(createOidc(true), [UserPermission.CreateUser], user);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });
    });
  });

  describe('when isAuthenticated() is false', () => {
    it('should return raise an UnauthorizedException', () => {
      createEnvironment(createOidc(false));

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when isAuthenticated() is not present', () => {
    it('should return raise an UnauthorizedException', () => {
      createEnvironment(createOidc(undefined));

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when oidc is not present', () => {
    it('should return raise an UnauthorizedException', () => {
      createEnvironment();

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });
});

function createEnvironment(
  oidc?: any,
  permissions?: UserPermission[],
  user?: User,
): void {
  host = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => {
        return {
          oidc,
          appSession: {
            user: user,
          },
        };
      },
    }),
  });

  reflector = createMock<Reflector>({
    get: () => {
      return permissions;
    },
  });
}

function createOidc(authenticated: boolean | undefined): any {
  return createMock<any>({
    isAuthenticated: () => authenticated,
  });
}

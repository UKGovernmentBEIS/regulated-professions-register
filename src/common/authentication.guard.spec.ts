import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';
import { UserPermission, User } from '../users/user.entity';
import userFactory from '../testutils/factories/user';

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
        createEnvironment(
          createOidc(true),
          [UserPermission.CreateUser],
          userFactory.build({
            permissions: [UserPermission.CreateUser],
          }),
        );

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(true);
      });

      it('should return false when the user does not have the appropriate permission', () => {
        createEnvironment(
          createOidc(true),
          [UserPermission.CreateUser],
          userFactory.build({
            permissions: [UserPermission.CreateOrganisation],
          }),
        );

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
      });

      it('should return false when the user has no permissions', () => {
        createEnvironment(
          createOidc(true),
          [UserPermission.CreateUser],
          userFactory.build({ permissions: [] }),
        );

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
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

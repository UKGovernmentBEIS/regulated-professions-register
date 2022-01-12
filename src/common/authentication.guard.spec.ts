import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';
import { UserPermission, User } from '../users/user.entity';

describe('AuthenticationGuard', () => {
  let host: ExecutionContext;
  let oidc: any;
  let guard: AuthenticationGuard;
  let reflector: Reflector;
  let permissions: string[];
  let user: User;

  beforeEach(() => {
    host = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => {
          return {
            oidc: oidc,
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

    guard = new AuthenticationGuard(reflector);
  });

  describe('when isAuthenticated() is true', () => {
    beforeEach(() => {
      oidc = createMock<any>({
        isAuthenticated: () => true,
      });
    });

    it('should return true', () => {
      expect(guard.canActivate(host)).toStrictEqual(true);
    });

    describe('when permissions are specified', () => {
      beforeEach(() => {
        permissions = [UserPermission.CreateUser];
      });

      it('should return true when the user has the appropriate permission', () => {
        user = new User();
        user.permissions = [UserPermission.CreateUser];

        expect(guard.canActivate(host)).toStrictEqual(true);
      });

      it('should return false when the user does not have the appropriate permission', () => {
        user = new User();
        user.permissions = [UserPermission.CreateOrganisation];

        expect(guard.canActivate(host)).toStrictEqual(false);
      });

      it('should return false when the user has no permissions', () => {
        user = new User();
        user.permissions = [];

        expect(guard.canActivate(host)).toStrictEqual(false);
      });
    });
  });

  describe('when isAuthenticated() is false', () => {
    beforeEach(() => {
      oidc = createMock<any>({
        isAuthenticated: () => false,
      });
    });

    it('should return raise an UnauthorizedException', () => {
      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when isAuthenticated() is not present', () => {
    beforeEach(() => {
      oidc = createMock<any>({
        isAuthenticated: undefined,
      });
    });

    it('should return raise an UnauthorizedException', () => {
      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when oidc is not present', () => {
    beforeEach(() => {
      oidc = undefined;
    });

    it('should return raise an UnauthorizedException', () => {
      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });
});

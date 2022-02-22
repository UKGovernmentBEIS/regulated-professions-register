import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';
import userFactory from '../testutils/factories/user';
import { UserPermission } from '../users/user-permission';
import { getPermissionsFromUser } from '../users/helpers/get-permissions-from-user.helper';
import { getActingUser } from '../users/helpers/get-acting-user.helper';

jest.mock('../users/helpers/get-permissions-from-user.helper');
jest.mock('../users/helpers/get-acting-user.helper');

describe('AuthenticationGuard', () => {
  describe('when isAuthenticated() is true', () => {
    it('should return true', () => {
      const host = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => {
            return {
              oidc: createMock<any>({
                isAuthenticated: () => true,
              }),
            };
          },
        }),
      });

      const reflector = createMock<Reflector>({
        get: () => {
          return undefined;
        },
      });

      const guard = new AuthenticationGuard(reflector);

      expect(guard.canActivate(host)).toStrictEqual(true);
    });

    describe('when permissions are specified', () => {
      it('should return true when the user has the appropriate permission', () => {
        const user = userFactory.build();
        (getActingUser as jest.Mock).mockReturnValue(user);

        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [UserPermission.CreateUser];
          },
        });

        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateUser,
        ]);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(true);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });

      it('should return false when the user does not have the appropriate permission', () => {
        const user = userFactory.build();
        (getActingUser as jest.Mock).mockReturnValue(user);

        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [UserPermission.CreateOrganisation];
          },
        });

        (getPermissionsFromUser as jest.Mock).mockReturnValue([
          UserPermission.CreateUser,
        ]);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });

      it('should return false when the user has no permissions', () => {
        const user = userFactory.build();
        (getActingUser as jest.Mock).mockReturnValue(user);

        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [];
          },
        });

        (getPermissionsFromUser as jest.Mock).mockReturnValue([]);

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
        expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      });
    });
  });

  describe('when isAuthenticated() is false', () => {
    it('should return raise an UnauthorizedException', () => {
      const host = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => {
            return {
              oidc: createMock<any>({
                isAuthenticated: () => false,
              }),
            };
          },
        }),
      });

      const reflector = createMock<Reflector>({
        get: () => {
          return undefined;
        },
      });

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when isAuthenticated() is not present', () => {
    it('should return raise an UnauthorizedException', () => {
      const host = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => {
            return {
              oidc: createMock<any>({
                isAuthenticated: undefined,
              }),
            };
          },
        }),
      });

      const reflector = createMock<Reflector>({
        get: () => {
          return undefined;
        },
      });

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('when oidc is not present', () => {
    it('should return raise an UnauthorizedException', () => {
      const host = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => {
            return {};
          },
        }),
      });

      const reflector = createMock<Reflector>({
        get: () => {
          return undefined;
        },
      });

      const guard = new AuthenticationGuard(reflector);

      expect(() => {
        guard.canActivate(host);
      }).toThrow(UnauthorizedException);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

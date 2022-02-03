import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';
import { UserPermission } from '../users/user.entity';
import userFactory from '../testutils/factories/user';

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
        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
                appSession: {
                  user: userFactory.build({
                    permissions: [UserPermission.CreateUser],
                  }),
                },
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [UserPermission.CreateUser];
          },
        });

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(true);
      });

      it('should return false when the user does not have the appropriate permission', () => {
        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
                appSession: {
                  user: userFactory.build({
                    permissions: [UserPermission.CreateUser],
                  }),
                },
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [UserPermission.CreateOrganisation];
          },
        });

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
      });

      it('should return false when the user has no permissions', () => {
        const host = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => {
              return {
                oidc: createMock<any>({
                  isAuthenticated: () => true,
                }),
                appSession: {
                  user: userFactory.build({
                    permissions: [UserPermission.CreateUser],
                  }),
                },
              };
            },
          }),
        });

        const reflector = createMock<Reflector>({
          get: () => {
            return [];
          },
        });

        const guard = new AuthenticationGuard(reflector);

        expect(guard.canActivate(host)).toStrictEqual(false);
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
});

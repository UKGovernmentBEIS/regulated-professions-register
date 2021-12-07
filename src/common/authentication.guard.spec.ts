import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let host: ExecutionContext;
  let oidc: any;
  let guard: AuthenticationGuard;

  beforeEach(() => {
    host = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => {
          return {
            oidc: oidc,
          };
        },
      }),
    });

    guard = new AuthenticationGuard();
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

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { createMock } from '@golevelup/ts-jest';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let host: ExecutionContext;
  let request: any;
  let guard: AuthenticationGuard;

  beforeEach(() => {
    host = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    });

    guard = new AuthenticationGuard();
  });

  describe('when isAuthenticated() is true', () => {
    beforeEach(() => {
      request = createMock<any>({
        isAuthenticated: () => true,
      });
    });

    it('should return true', () => {
      expect(guard.canActivate(host)).toStrictEqual(true);
    });
  });

  describe('when isAuthenticated() is false', () => {
    beforeEach(() => {
      request = createMock<any>({
        isAuthenticated: () => false,
      });
    });

    it('should return true', () => {
      expect(guard.canActivate(host)).toStrictEqual(false);
    });
  });

  describe('when isAuthenticated() is not present', () => {
    beforeEach(() => {
      request = createMock<any>({
        isAuthenticated: undefined,
      });
    });

    it('should return true', () => {
      expect(guard.canActivate(host)).toStrictEqual(false);
    });
  });
});

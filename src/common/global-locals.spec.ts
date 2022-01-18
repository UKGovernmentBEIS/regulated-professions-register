import { globalLocals, RequestWithAppSession } from './global-locals';
import { Response, NextFunction, Application } from 'express';
import userFactory from '../testutils/factories/user';

import { createMock, DeepMocked } from '@golevelup/ts-jest';

const user = userFactory.build({
  email: 'email@example.com',
  name: 'name',
  externalIdentifier: '212121',
});

describe('globalLocals', () => {
  let request: DeepMocked<RequestWithAppSession>;
  let response: DeepMocked<Response>;
  let next: DeepMocked<NextFunction>;

  beforeEach(() => {
    request = createMock<RequestWithAppSession>({
      originalUrl: 'http://localhost/foo',
    });
    response = createMock<Response>({
      app: createMock<Application>({}),
    });
    next = createMock<NextFunction>(() => {
      return true;
    });
  });

  describe('when the request has a user', () => {
    beforeEach(() => {
      request.appSession = {
        user: user,
      };
    });

    it('sets the expected variables', () => {
      globalLocals(request, response, next);

      expect(response.app.locals.isLoggedin).toEqual(true);
      expect(response.app.locals.user).toEqual(user);
      expect(response.app.locals.currentUrl).toEqual('http://localhost/foo');
    });
  });

  describe('when the request does not have a user', () => {
    it('sets the expected variables', () => {
      globalLocals(request, response, next);

      expect(response.app.locals.isLoggedin).toEqual(false);
      expect(response.app.locals.user).toEqual(undefined);
      expect(response.app.locals.currentUrl).toEqual('http://localhost/foo');
    });
  });
});

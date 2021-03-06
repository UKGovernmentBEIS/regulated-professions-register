import { globalLocals } from './global-locals';
import { RequestWithAppSession } from './interfaces/request-with-app-session.interface';

import { Response, NextFunction, Application } from 'express';
import userFactory from '../testutils/factories/user';

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { User } from '../users/user.entity';
import { getPermissionsFromUser } from '../users/helpers/get-permissions-from-user.helper';
import { UserPermission } from '../users/user-permission';
import { getActingUser } from '../users/helpers/get-acting-user.helper';
import { canChangeProfession } from '../users/helpers/can-change-profession';

import professionFactory from '../testutils/factories/profession';

jest.mock('../users/helpers/get-permissions-from-user.helper');
jest.mock('../users/helpers/get-acting-user.helper');
jest.mock('../users/helpers/can-change-profession');

let request: DeepMocked<RequestWithAppSession>;
let response: DeepMocked<Response>;
let next: DeepMocked<NextFunction>;

describe('globalLocals', () => {
  describe('when the request has a user', () => {
    it('sets the expected variables', () => {
      createEnvironment();
      const user = createUserInEnvironment();
      const profession = professionFactory.build();

      const permissions = [
        UserPermission.CreateOrganisation,
        UserPermission.DeleteOrganisation,
      ];

      (getPermissionsFromUser as jest.Mock).mockReturnValue(permissions);
      (canChangeProfession as jest.Mock).mockReturnValue(true);

      globalLocals(request, response, next);

      expect(response.app.locals.isLoggedin).toEqual(true);
      expect(response.app.locals.user).toEqual(user);
      expect(response.app.locals.permissions).toEqual(permissions);
      expect(response.app.locals.currentUrl).toEqual('http://localhost/foo');
      expect(response.app.locals.canChangeProfession(profession)).toEqual(true);

      expect(getPermissionsFromUser).toHaveBeenCalledWith(user);
      expect(canChangeProfession).toHaveBeenCalledWith(user, profession);
    });
  });

  describe('when the request does not have a user', () => {
    it('sets the expected variables', () => {
      createEnvironment();

      globalLocals(request, response, next);

      expect(response.app.locals.isLoggedin).toEqual(false);
      expect(response.app.locals.user).toEqual(undefined);
      expect(response.app.locals.permissions).toEqual(undefined);
      expect(response.app.locals.currentUrl).toEqual('http://localhost/foo');
      expect(
        response.app.locals.canChangeProfession(professionFactory.build()),
      ).toEqual(undefined);

      expect(getPermissionsFromUser).not.toHaveBeenCalled();
      expect(canChangeProfession).not.toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

function createEnvironment(): void {
  request = createMock<RequestWithAppSession>({
    originalUrl: 'http://localhost/foo',
  });
  response = createMock<Response>({
    app: createMock<Application>({}),
  });
  next = createMock<NextFunction>(() => {
    return true;
  });
}

function createUserInEnvironment(): User {
  const user = userFactory.build({
    email: 'email@example.com',
    name: 'name',
    externalIdentifier: '212121',
  });

  (getActingUser as jest.Mock).mockReturnValue(user);

  return user;
}

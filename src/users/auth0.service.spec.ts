import { Auth0Service } from './auth0.service';
import { ManagementClient } from 'auth0';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Auth0Service', () => {
  let auth0Service: Auth0Service;
  let email: string;
  let managementClient: DeepMocked<ManagementClient>;
  let users: Array<any>;

  beforeEach(() => {
    email = 'email@example.com';
    managementClient = createMock<ManagementClient>({
      getUsersByEmail: () => {
        return users;
      },
      createUser: () => {
        return {
          user_id: 123,
        };
      },
      createPasswordChangeTicket: () => {
        return {
          ticket: 'http://example.com',
        };
      },
    });
    auth0Service = new Auth0Service();

    const getClient = jest.spyOn(Auth0Service.prototype as any, 'getClient');
    getClient.mockImplementation(() => {
      return managementClient;
    });
  });

  describe('createUser', () => {
    describe('when the user does not exist', () => {
      beforeEach(() => {
        users = [];
      });

      it('should create a user', async () => {
        const result = await auth0Service.createUser(email);

        expect(managementClient.getUsersByEmail).toHaveBeenCalledWith(email);
        expect(managementClient.createUser).toHaveBeenCalledWith({
          email: email,
          password: expect.anything(),
          email_verified: true,
          connection: 'Username-Password-Authentication',
        });
        expect(
          managementClient.createPasswordChangeTicket,
        ).toHaveBeenCalledWith({
          result_url: `${process.env['HOST_URL']}/admin`,
          user_id: 123,
        });

        expect(result).toEqual({
          result: 'user-created',
          externalIdentifier: 123,
          passwordResetLink: 'http://example.com',
        });
      });
    });

    describe('when the user exists', function () {
      beforeEach(() => {
        users = [
          {
            user_id: 123,
          },
        ];
      });

      it('should return a user-exists object', async () => {
        const result = await auth0Service.createUser(email);

        expect(managementClient.getUsersByEmail).toHaveBeenCalledWith(email);
        expect(managementClient.createUser).not.toHaveBeenCalled();
        expect(
          managementClient.createPasswordChangeTicket,
        ).not.toHaveBeenCalled();

        expect(result).toEqual({
          result: 'user-exists',
          externalIdentifier: 123,
        });
      });
    });
  });
});

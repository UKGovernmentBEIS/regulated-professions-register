import { Auth0Service } from './auth0.service';
import {
  GetUsers200ResponseOneOfInner,
  ManagementClient,
  PostPasswordChange201Response,
  TicketsManager,
  UsersByEmailManager,
  UsersManager,
} from 'auth0';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import * as dotenv from 'dotenv';
import { Queue } from 'bull';
import { ApiResponse } from 'auth0/dist/cjs/lib/runtime';
import { Head, Header, NotImplementedException } from '@nestjs/common';

dotenv.config({ path: '.env.test' });

describe('Auth0Service', () => {
  let auth0Service: Auth0Service;
  let email: string;
  let managementClient: DeepMocked<ManagementClient>;
  let users: Array<any>;
  let queue: DeepMocked<Queue>;

  let usersByEmailResponseMock: DeepMocked<GetUsers200ResponseOneOfInner>;
  let usersByEmailResponse: ApiResponse<Array<GetUsers200ResponseOneOfInner>>;

  let userCreateResponseMock: DeepMocked<GetUsers200ResponseOneOfInner>;
  let userReponse: ApiResponse<GetUsers200ResponseOneOfInner>;

  let changePasswordResponseMock: DeepMocked<PostPasswordChange201Response>;
  let changePasswordResponse: ApiResponse<PostPasswordChange201Response>;

  beforeEach(() => {
    email = 'email@example.com';

    usersByEmailResponseMock = createMock<GetUsers200ResponseOneOfInner>();
    userCreateResponseMock = createMock<GetUsers200ResponseOneOfInner>();
    changePasswordResponseMock = createMock<PostPasswordChange201Response>();

    managementClient = createMock<ManagementClient>({
      usersByEmail: createMock<UsersByEmailManager>({
        getByEmail(requestParameters: any) {
          return Promise.resolve(usersByEmailResponse);
        },
      }),
      users: createMock<UsersManager>({
        create: (bodyParameters: any) => {
          return Promise.resolve(userReponse);
        },
      }),
      tickets: createMock<TicketsManager>({
        changePassword(bodyParameters) {
          return Promise.resolve(changePasswordResponse);
        },
      }),
    });
    queue = createMock<Queue>();
    auth0Service = new Auth0Service(queue);

    const getClient = jest.spyOn(Auth0Service.prototype as any, 'getClient');
    getClient.mockImplementation(() => {
      return managementClient;
    });
  });

  describe('createUser', () => {
    describe('when the user does not exist', () => {
      beforeEach(() => {
        usersByEmailResponse = {
          data: [],
          status: 200,
          statusText: 'OK',
          headers: null,
        };

        userCreateResponseMock.email = email;
        userCreateResponseMock.user_id = '123';
        userReponse = {
          data: userCreateResponseMock,
          status: 200,
          statusText: 'OK',
          headers: null,
        };

        changePasswordResponseMock.ticket = 'http://example.com';
        changePasswordResponse = {
          data: changePasswordResponseMock,
          status: 200,
          statusText: 'OK',
          headers: null,
        };
      });

      it('should create a user', async () => {
        const result = await auth0Service.createUser(email);

        expect(managementClient.usersByEmail.getByEmail).toHaveBeenCalledWith({
          email,
        });
        expect(managementClient.users.create).toHaveBeenCalledWith({
          email: email,
          password: expect.anything(),
          email_verified: true,
          connection: 'Username-Password-Authentication',
        });
        expect(managementClient.tickets.changePassword).toHaveBeenCalledWith({
          result_url: `${process.env['HOST_URL']}/admin`,
          ttl_sec: 2592000,
          user_id: '123',
        });

        expect(result).toEqual({
          result: 'user-created',
          externalIdentifier: '123',
          passwordResetLink: 'http://example.com',
        });
      });
    });

    describe('when the user exists', function () {
      beforeEach(() => {
        usersByEmailResponseMock.user_id = '123';
        usersByEmailResponse = {
          data: [usersByEmailResponseMock],
          status: 200,
          statusText: 'OK',
          headers: null,
        };
      });

      it('should return a user-exists object', async () => {
        const result = await auth0Service.createUser(email);

        expect(managementClient.usersByEmail.getByEmail).toHaveBeenCalledWith({
          email,
        });
        expect(managementClient.users.create).not.toHaveBeenCalled();
        expect(managementClient.tickets.changePassword).not.toHaveBeenCalled();

        expect(result).toEqual({
          result: 'user-exists',
          externalIdentifier: '123',
        });
      });
    });
  });

  describe('deleteUser', () => {
    describe('performNow', () => {
      it('should delete a user via the API', async () => {
        await auth0Service.deleteUser('some-uuid').performNow();

        expect(managementClient.users.delete).toHaveBeenCalledWith({
          id: 'some-uuid',
        });
      });
    });

    describe('performLater', () => {
      it('should delete a user via the API', async () => {
        await auth0Service.deleteUser('some-uuid').performLater();

        expect(queue.add).toHaveBeenCalledWith('deleteUser', {
          externalIdentifier: 'some-uuid',
        });
      });
    });
  });
});

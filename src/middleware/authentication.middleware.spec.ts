import { ForbiddenException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { createMock } from '@golevelup/ts-jest';

import { AuthenticationMidleware } from './authentication.middleware';
import { User } from '../users/user.entity';

import { createPlausibleEvent } from '../common/create-plausible-event';

jest.mock('../common/create-plausible-event');

describe('AuthenticationMidleware', () => {
  let middleware: AuthenticationMidleware;
  let user: User;

  beforeEach(async () => {
    jest.resetAllMocks();
    const app = createMock<NestExpressApplication>({
      select: () => ({
        get: () => ({
          findByExternalIdentifier: () => user,
        }),
      }),
    });

    middleware = new AuthenticationMidleware(app);
  });

  describe('afterCallback', () => {
    it('returns the user with the other credentials when the user exists', async () => {
      user = new User('email@example.com', 'name', '212121');

      const session = {
        id_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      };

      expect(await middleware.afterCallback(session)).toEqual({
        ...session,
        user,
      });
    });

    it('throws an error if the user does not exist', async () => {
      user = undefined;

      const session = {
        id_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      };

      await expect(async () => {
        await middleware.afterCallback(session);
      }).rejects.toThrowError(ForbiddenException);
    });

    describe('when the environment is set to production', () => {
      it('sends an event to Plausible', async () => {
        process.env['NODE_ENV'] = 'production';

        user = new User('email@example.com', 'name', '212121');

        const session = {
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
        };

        await middleware.afterCallback(session);

        expect(createPlausibleEvent).toHaveBeenCalledWith('login', '/login');
      });
    });

    describe('when the environment is not set to production', () => {
      it('does not send an event to Plausible', async () => {
        process.env['NODE_ENV'] = 'development';

        user = new User('email@example.com', 'name', '212121');

        const session = {
          id_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
        };

        await middleware.afterCallback(session);

        expect(createPlausibleEvent).not.toHaveBeenCalled();
      });
    });
  });
});

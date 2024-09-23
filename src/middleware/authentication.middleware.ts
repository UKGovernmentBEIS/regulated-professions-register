import { ForbiddenException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RequestHandler } from 'express';
import { auth, SessionStore } from 'express-openid-connect';
import { createPlausibleEvent } from '../common/create-plausible-event';

import jwt_decode from 'jwt-decode';

import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import redisConfig from '../config/redis.config';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';

const baseURL =
  process.env['HOST_URL'] ||
  `https://${process.env['HEROKU_APP_NAME']}.herokuapp.com`;

/**
 * Set up an instance of the `express-openid-connect` authentication middleware for
 * use in the application. Using this in a class allows us to access the database
 * to fetch a user from the database and include it in the session.
 *
 * @constructor
 * @param {NestExpressApplication} app - The instance of the NestJS application being set up
 *
 */
export class AuthenticationMidleware {
  usersService: UsersService;

  constructor(private app: NestExpressApplication) {
    this.usersService = this.app.select(UsersModule).get(UsersService);
  }

  /**
   * Set the configuration of the `express-openid-connect` authentication middleware
   * and return it
   *
   * @returns {RequestHandler} - The authentication middleware
   */
  public auth(): RequestHandler {
    const redisClient = new Redis(redisConfig().redis);

    return auth({
      issuerBaseURL: process.env['AUTH0_DOMAIN'],
      baseURL: baseURL,
      clientID: process.env['AUTH0_CLIENT_ID'],
      clientSecret: process.env['AUTH0_CLIENT_SECRET'],
      secret: process.env['APP_SECRET'],
      authRequired: false,
      auth0Logout: true,
      authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email',
      },
      session: {
        store: new RedisStore({ client: redisClient }) as any as SessionStore,
      },
      afterCallback: async (_req, _res, session) => {
        return await this.afterCallback(session);
      },
      getLoginState() {
        return {
          returnTo: '/admin/dashboard',
        };
      },
    });
  }

  /**
   * Hook into the callback that gets used after a successful authentication, search
   * for our local user and inject it into the session.
   *
   * The user will be available in the application as `request.appSession.user`
   *
   * @param session
   * @returns The session variables to be set in `request.appSession`
   *
   * @throws {ForbiddenException} - If the user does not exist in the database
   */
  public async afterCallback(session: any): Promise<any> {
    const userInfo = jwt_decode(session.id_token);
    const user = await this.usersService.findByExternalIdentifier(
      userInfo['sub'],
    );

    if (user === undefined) {
      throw new ForbiddenException();
    }

    if (process.env['NODE_ENV'] === 'production') {
      await createPlausibleEvent('login', '/login');
    }

    return {
      ...session,
      user,
    };
  }
}

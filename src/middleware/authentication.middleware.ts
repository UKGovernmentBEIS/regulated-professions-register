import { ForbiddenException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RequestHandler } from 'express';
import { auth } from 'express-openid-connect';

import jwt_decode from 'jwt-decode';

import { UsersModule } from '../users/users.module';
import { UserService } from '../users/user.service';

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
  userService: UserService;

  constructor(private app: NestExpressApplication) {
    this.userService = this.app.select(UsersModule).get(UserService);
  }

  /**
   * Set the configuration of the `express-openid-connect` authentication middleware
   * and return it
   *
   * @returns {RequestHandler} - The authentication middleware
   */
  public auth(): RequestHandler {
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
      afterCallback: async (_req, _res, session) => {
        return await this.afterCallback(session);
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
    const user = await this.userService.findByExternalIdentifier(
      userInfo['sub'],
    );

    if (user === undefined) {
      throw new ForbiddenException();
    }

    return {
      ...session,
      user,
    };
  }
}

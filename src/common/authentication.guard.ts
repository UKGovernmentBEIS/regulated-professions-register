import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Checks if a user is authenticated and returns `true` or `false`
 *
 * This class is a NestJS Guard that checks if a user is authenticated
 * by checking the `isAuthenticated` method this is added to the
 * request by the Express OpenID Connect middleware (https://github.com/auth0/express-openid-connect)
 *
 * It uses the `canActivate` methods to get the request from the execution
 * context and first checks if the `isAuthenticated` method exists and then if
 * it is true or false.
 * *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseGuards(AuthenticationGuard)
 *
 * @raises `UnauthorizedException` if a user is not authenticated
 *
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const loggedIn: boolean =
      typeof request?.oidc?.isAuthenticated !== 'undefined' &&
      request.oidc.isAuthenticated();

    if (!loggedIn) {
      throw new UnauthorizedException();
    }

    return loggedIn;
  }
}

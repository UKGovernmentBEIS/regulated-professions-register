import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserPermission } from '../users/user.entity';

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
 *
 * If the user is logged in, it also checks any metadata (added by the
 * `Roles` metadata in a controller) to match these permissions against the
 * permissions held by a logged in user. If the user does not have the expected
 * role, we return false, which in turn, raises a `ForbiddenException`
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseGuards(AuthenticationGuard)
 *
 * @raises `UnauthorizedException` if a user is not authenticated
 *
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<UserPermission[]>(
      'permissions',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const loggedIn: boolean =
      typeof request?.oidc?.isAuthenticated !== 'undefined' &&
      request.oidc.isAuthenticated();

    if (!loggedIn) {
      throw new UnauthorizedException();
    }

    if (!permissions) {
      return loggedIn;
    } else {
      const user = request.appSession.user as User;

      return this.matchPermissions(user, permissions);
    }
  }

  matchPermissions(user: User, permissions: UserPermission[]): boolean {
    return user.permissions.some((permission: UserPermission) =>
      permissions.includes(permission),
    );
  }
}

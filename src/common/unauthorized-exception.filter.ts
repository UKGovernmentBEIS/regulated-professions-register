import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches an `UnauthorizedException` and redirects to the login
 *
 * This class is a NestJS ExceptionFilter that catches
 * `UnauthorizedException`s and redirects to the login page.
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseFilters(UnauthorizedExceptionFilter)
 *
 */
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  async catch(_exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect(302, '/login');
  }
}

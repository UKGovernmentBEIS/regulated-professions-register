import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches a `ForbiddenException` and redirects to the login
 *
 * This class is a NestJS ExceptionFilter that catches
 * `ForbiddenException`s and redirects to the login page.
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseFilters(UnauthorizedExceptionFilter)
 *
 */
@Catch(ForbiddenException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  async catch(_exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.redirect(302, '/login');
  }
}

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
 * `ForbiddenException`s and renders an error page.
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseFilters(ForbiddenExceptionFilter)
 *
 */
@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  async catch(_exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.render('errors/forbidden');
  }
}

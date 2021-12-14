import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches a `HttpException` and renders an error page
 *
 * This class is a NestJS ExceptionFilter that catches all
 * `HttpException`s and renders an error page.
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseFilters(HttpExceptionFilter)
 *
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof UnauthorizedException) {
      response.redirect(302, '/login');
    } else if (exception instanceof ForbiddenException) {
      response.render('errors/forbidden');
    } else if (exception instanceof NotFoundException) {
      response.render('errors/not-found');
    } else {
      response.render('errors/generic-error');
    }
  }
}

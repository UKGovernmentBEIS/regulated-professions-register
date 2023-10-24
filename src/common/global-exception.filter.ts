import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import Rollbar from 'rollbar';

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
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    switch (status) {
      case HttpStatus.UNAUTHORIZED: {
        response.redirect(302, '/login');
        break;
      }
      case HttpStatus.FORBIDDEN: {
        response.render('errors/forbidden');
        break;
      }
      case HttpStatus.NOT_FOUND: {
        response.render('errors/not-found');
        break;
      }
      default: {
        if (process.env['NODE_ENV'] !== 'development') {
          this.sendErrorToRollbar(exception, request);
        }

        Logger.error(exception.stack);

        response.render('errors/generic-error');
      }
    }
  }

  private sendErrorToRollbar(exception: any, request: Request): void {
    const rollbarClient = this.getRollbarClient();
    rollbarClient.error(exception, request);
  }

  private getRollbarClient(): Rollbar {
    return new Rollbar({
      accessToken: process.env['ROLLBAR_TOKEN'],
      captureUncaught: true,
      captureIp: false,
      captureUnhandledRejections: true,
      payload: {
        environment: process.env['ENVIRONMENT'],
      },
    });
  }
}

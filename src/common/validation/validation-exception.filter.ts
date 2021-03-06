import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationFailedError } from './validation-failed.error';

/**
 * Catches a `ValidationFailedError` and renders a view
 *
 * This class is a NestJS ExceptionFilter that catches
 * `ValidationFailedError`s and renders a specific view, with
 * the data from the error, the object that caused the exception
 * and the URL of the request (so it can be reused for the form's
 * action)
 *
 * @example (in a controller, as metadata above a controller action)
 *
 * @UseFilters(new ValidationExceptionFilter('blog-posts/edit', 'blogPost'))
 *
 * This will render the view `blog-posts/edit` with the following variables
 * being made available to the template:
 *
 * {
 *  errors: / The `fullMessages` stored in the `ValidationFailedError`/,
 *  blogPost: /The object which caused the error/
 *  url: /The URL that made the request/
 * }
 */
@Catch(ValidationFailedError)
export class ValidationExceptionFilter implements ExceptionFilter {
  view: string;
  objectName: string;
  additionalVariables: any;

  constructor(
    view: string,
    objectName?: string,
    additionalVariables?: Record<string, unknown>,
  ) {
    this.view = view;
    this.objectName = objectName;
    this.additionalVariables = additionalVariables || {};
  }

  async catch(exception: ValidationFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let values = {
      ...this.additionalVariables,
      errors: exception.fullMessages(),
      url: request.url,
    };

    if (this.objectName === undefined) {
      values = { ...values, ...exception.target };
    } else {
      values = {
        ...values,
        [this.objectName]: exception.target,
      };
    }

    response.render(this.view, values);
  }
}

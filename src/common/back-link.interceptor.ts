import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface Response<T> {
  data: T;
}

export type Generator = (request: Request) => string;
@Injectable()
export class BackLinkInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly backLink: string;
  private readonly generator: Generator;

  constructor(arg: string | Generator) {
    if (typeof arg === 'string') {
      this.backLink = arg;
    } else {
      this.generator = arg;
    }
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const backLink = this.generateBackLink(request);
    const requestUrl = `${request.protocol}://${request.get('host')}${
      request.originalUrl
    }`;

    console.log(requestUrl);

    if (backLink == requestUrl || backLink == request.get('Referrer')) {
      response.locals.backLink = '#';
    } else {
      response.locals.backLink = backLink;
    }

    return next.handle();
  }

  private generateBackLink(request: Request) {
    const regexp = new RegExp(':([a-zA-Z]+)', 'g');

    let backLink = this.backLink ? this.backLink : this.generator(request);

    if (backLink) {
      const matches = [...backLink.matchAll(regexp)];

      matches.forEach((match) => {
        const key = match[1];
        if (request.params[key]) {
          backLink = backLink.replace(`:${key}`, request.params[key]);
        }
      });

      return backLink;
    }
  }
}

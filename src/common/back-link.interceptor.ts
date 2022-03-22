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
  private readonly linkTitle: string;
  private readonly generator: Generator;

  constructor(arg: string | Generator, linkTitle = '') {
    if (typeof arg === 'string') {
      this.backLink = arg;
    } else {
      this.generator = arg;
    }

    this.linkTitle = linkTitle;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    response.locals.backLink = this.generateBackLink(request);
    response.locals.linkTitle = this.linkTitle;

    return next.handle();
  }

  private generateBackLink(request: Request) {
    const regexp = new RegExp(':([a-zA-Z]+)', 'g');

    let backLink = this.backLink ? this.backLink : this.generator(request);

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

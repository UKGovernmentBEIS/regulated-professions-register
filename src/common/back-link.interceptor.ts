import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  data: T;
}

@Injectable()
export class BackLinkInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly backLink: string) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next
      .handle()
      .pipe(
        map((data) => ({ ...data, backLink: this.generateBackLink(request) })),
      );
  }

  private generateBackLink(request: Request) {
    const regexp = new RegExp(':([a-z]+)', 'g');
    const matches = [...this.backLink.matchAll(regexp)];

    let backLink = this.backLink;

    matches.forEach((match) => {
      const key = match[1];
      if (request.params[key]) {
        backLink = backLink.replace(`:${key}`, request.params[key]);
      }
    });

    return backLink;
  }
}

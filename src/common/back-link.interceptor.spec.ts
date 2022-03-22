import { ExecutionContext, CallHandler } from '@nestjs/common';
import { BackLinkInterceptor } from './back-link.interceptor';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request, Response } from 'express';

describe('BackLinkInterceptor', () => {
  let context: DeepMocked<ExecutionContext>;
  let next: DeepMocked<CallHandler>;
  let request: DeepMocked<Request>;
  let response: DeepMocked<Response>;

  beforeEach(() => {
    next = createMock<CallHandler>();
    request = createMock<Request>();
    response = createMock<Response>();

    context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    });
  });

  describe('when the argument is a string', () => {
    it('should add the backLink to the call handler', () => {
      const backLink = '/foo/bar';
      const interceptor = new BackLinkInterceptor(backLink);

      interceptor.intercept(context, next);

      expect(response.locals.backLink).toEqual(backLink);
    });

    describe('when there are params specified', () => {
      beforeEach(() => {
        request = createMock<Request>({
          params: {
            bazName: 'boo',
            id: '123',
          },
        });
      });

      it('should replace placeholders with params', () => {
        const backLink = '/foo/bar/:bazName';
        const interceptor = new BackLinkInterceptor(backLink);

        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual('/foo/bar/boo');
      });

      it('should ignore non-existent params', () => {
        const backLink = '/foo/bar/:biff';

        const interceptor = new BackLinkInterceptor(backLink);

        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual(backLink);
      });

      it('should use multiple params', () => {
        const backLink = '/foo/:id/:bazName';

        const interceptor = new BackLinkInterceptor(backLink);

        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual('/foo/123/boo');
      });
    });
  });

  describe('when the argument is a function', () => {
    const generator = (request: Request) =>
      request.params.foo === 'bar' ? '/foo' : '/foo/:id';
    const interceptor = new BackLinkInterceptor(generator);

    describe('when the generator conditional is true', () => {
      beforeEach(() => {
        request = createMock<Request>({
          params: {
            foo: 'bar',
            id: '123',
          },
        });
      });

      it('should generate a backlink depending on the params', () => {
        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual('/foo');
      });
    });

    describe('when the generator conditional is false', () => {
      beforeEach(() => {
        request = createMock<Request>({
          params: {
            foo: 'baz',
            id: '123',
          },
        });
      });

      it('should generate a backlink depending on the params', () => {
        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual('/foo/123');
      });
    });

    describe('when the generator conditional returns undefined', () => {
      it('should make the backlink undefined', () => {
        const generator = () => undefined;
        const interceptor = new BackLinkInterceptor(generator);

        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual(undefined);
      });
    });
  });

  describe('when a link title is specified', () => {
    it('should add the backLink and the title to the call handler', () => {
      const backLink = '/foo/bar';
      const linkTitle = 'foo/bar';
      const interceptor = new BackLinkInterceptor(backLink, linkTitle);

      interceptor.intercept(context, next);

      expect(response.locals.backLink).toEqual(backLink);
      expect(response.locals.linkTitle).toEqual(linkTitle);
    });
  });
});

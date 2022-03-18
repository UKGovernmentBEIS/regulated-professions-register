import { ExecutionContext, CallHandler } from '@nestjs/common';
import { BackLinkInterceptor } from './back-link.interceptor';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request, Response } from 'express';
import { createMockRequest } from '../testutils/create-mock-request';

describe('BackLinkInterceptor', () => {
  let context: DeepMocked<ExecutionContext>;
  let next: DeepMocked<CallHandler>;
  let request: DeepMocked<Request>;
  let response: DeepMocked<Response>;

  beforeEach(() => {
    next = createMock<CallHandler>();
    response = createMock<Response>();
    request = createMockRequest('http://example.com/some/path', 'example.com');
    request.protocol = 'http';

    context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    });
  });

  describe('when the request URL does not match the backlink', () => {
    describe('when the argument is a string', () => {
      it('should add the backLink to the call handler', () => {
        const backLink = '/foo/bar';
        const interceptor = new BackLinkInterceptor(backLink);

        interceptor.intercept(context, next);

        expect(response.locals.backLink).toEqual(backLink);
      });

      describe('when there are params specified', () => {
        beforeEach(() => {
          request.params = {
            bazName: 'boo',
            id: '123',
          };
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
          request.params = {
            foo: 'bar',
            id: '123',
          };
        });

        it('should generate a backlink depending on the params', () => {
          interceptor.intercept(context, next);

          expect(response.locals.backLink).toEqual('/foo');
        });
      });

      describe('when the generator conditional is false', () => {
        beforeEach(() => {
          request.params = {
            foo: 'baz',
            id: '123',
          };
        });

        it('should generate a backlink depending on the params', () => {
          interceptor.intercept(context, next);

          expect(response.locals.backLink).toEqual('/foo/123');
        });
      });

      describe('when the generator returns undefined', () => {
        const generator = () => undefined;
        const interceptor = new BackLinkInterceptor(generator);

        it('should generate a backlink depending on the params', () => {
          interceptor.intercept(context, next);

          expect(response.locals.backLink).toEqual(undefined);
        });
      });
    });
  });

  describe('when the original URL matches the backlink', () => {
    beforeEach(() => {
      request.originalUrl = '/hello';
    });

    it('should return a hash as a backlink', () => {
      const backLink = 'http://example.com/hello';
      const interceptor = new BackLinkInterceptor(backLink);

      interceptor.intercept(context, next);

      expect(response.locals.backLink).toEqual('#');
    });
  });

  describe('when the referrer matches the back link', () => {
    beforeEach(() => {
      request = createMockRequest(
        'http://example.com/some/path',
        'example.com',
      );
    });

    it('should return a hash as a backlink', () => {
      const backLink = 'http://example.com/some/path';
      const interceptor = new BackLinkInterceptor(backLink);

      interceptor.intercept(context, next);

      expect(response.locals.backLink).toEqual('#');
    });
  });
});

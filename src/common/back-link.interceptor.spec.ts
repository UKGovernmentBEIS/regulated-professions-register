import { ExecutionContext, CallHandler } from '@nestjs/common';
import { BackLinkInterceptor } from './back-link.interceptor';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';

describe('BackLinkInterceptor', () => {
  let context: DeepMocked<ExecutionContext>;
  let next: DeepMocked<CallHandler>;

  beforeEach(() => {
    data = { foo: 'bar' };
    context = createMock<ExecutionContext>();
    next = createMock<CallHandler>({
      handle: jest.fn(() => of(data)),
    });
  });

  it('should add the backLink to the call handler', () => {
    const backLink = '/foo/bar';
    const interceptor = new BackLinkInterceptor(backLink);

    const response = interceptor.intercept(context, next);

    response.subscribe({
      next: (value) => {
        expect(value).toEqual({ ...data, backLink: backLink });
      },
    });
  });

  describe('when there are params specified', () => {
    beforeEach(() => {
      context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => {
            return {
              params: {
                baz: 'boo',
                id: 123,
              },
            };
          },
        }),
      });
    });

    it('replace placeholders with params', () => {
      const backLink = '/foo/bar/:baz';
      const interceptor = new BackLinkInterceptor(backLink);

      const response = interceptor.intercept(context, next);

      response.subscribe({
        next: (value) => {
          expect(value).toEqual({ ...data, backLink: '/foo/bar/boo' });
        },
      });
    });

    it('should ignore non-existent params', () => {
      const backLink = '/foo/bar/:biff';

      const interceptor = new BackLinkInterceptor(backLink);

      const response = interceptor.intercept(context, next);

      response.subscribe({
        next: (value) => {
          expect(value).toEqual({ ...data, backLink: backLink });
        },
      });
    });

    it('should use multiple params', () => {
      const backLink = '/foo/:id/:baz';

      const interceptor = new BackLinkInterceptor(backLink);

      const response = interceptor.intercept(context, next);

      response.subscribe({
        next: (value) => {
          expect(value).toEqual({ ...data, backLink: '/foo/123/boo' });
        },
      });
    });
  });
});

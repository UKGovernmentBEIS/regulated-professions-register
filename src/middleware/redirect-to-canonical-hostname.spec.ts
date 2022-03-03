import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request, Response, NextFunction } from 'express';
import { redirectToCanonicalHostname } from './redirect-to-canonical-hostname';

describe('redirectToCanonicalHostname', () => {
  let request: DeepMocked<Request>;
  let response: DeepMocked<Response>;
  let next: jest.Mock<NextFunction>;

  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('when the request does not have the the canonical hostname', () => {
    it('should redirect to the path with the correct hostname', () => {
      process.env = { ...OLD_ENV, CANONICAL_HOSTNAME: 'www.example.org' };

      request = createMock<Request>({
        header() {
          return 'www.example.com';
        },
        protocol: 'http',
        url: '/some/path',
      });
      response = createMock<Response>();
      next = jest.fn();

      redirectToCanonicalHostname(request, response, next);

      expect(response.redirect).toHaveBeenCalledWith(
        301,
        'http://www.example.org/some/path',
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the request has the the canonical hostname', () => {
    it('should not redirect', () => {
      process.env = { ...OLD_ENV, CANONICAL_HOSTNAME: 'www.example.org' };

      request = createMock<Request>({
        header() {
          return 'www.example.org';
        },
        protocol: 'http',
        url: '/some/path',
      });
      response = createMock<Response>();
      next = jest.fn();

      redirectToCanonicalHostname(request, response, next);

      expect(response.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});

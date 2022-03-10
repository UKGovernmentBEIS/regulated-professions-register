import {
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import Rollbar from 'rollbar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let exception: HttpException;

  let response: DeepMocked<Response>;
  let request: DeepMocked<Request>;
  let host: DeepMocked<ExecutionContext>;
  let rollbarClient: DeepMocked<Rollbar>;
  let service: GlobalExceptionFilter;

  const OLD_ENV = process.env;

  beforeEach(async () => {
    host = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    });

    rollbarClient = createMock<Rollbar>({
      error: jest.fn(() => {
        return {};
      }),
    });

    service = new GlobalExceptionFilter();

    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when the error is a NotFoundException', () => {
    describe('catch', () => {
      it('renders the not-found template', () => {
        response = createMock<Response>();
        exception = new NotFoundException();

        service.catch(exception, host);

        expect(response.render).toHaveBeenCalledWith('errors/not-found');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          const getRollbarClient = jest.spyOn(
            GlobalExceptionFilter.prototype as any,
            'getRollbarClient',
          );

          getRollbarClient.mockImplementation(() => {
            return rollbarClient;
          });

          exception = new NotFoundException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
          const logSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => null);

          exception = new NotFoundException();
          service.catch(exception, host);

          expect(logSpy).not.toHaveBeenCalledWith(exception.stack);
        });
      });
    });
  });

  describe('when the error is a ForbiddenException', () => {
    describe('catch', () => {
      it('renders the forbidden template', () => {
        response = createMock<Response>();
        exception = new ForbiddenException();

        service.catch(exception, host);

        expect(response.render).toHaveBeenCalledWith('errors/forbidden');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          const getRollbarClient = jest.spyOn(
            GlobalExceptionFilter.prototype as any,
            'getRollbarClient',
          );

          getRollbarClient.mockImplementation(() => {
            return rollbarClient;
          });

          exception = new ForbiddenException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
          const logSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => null);

          exception = new ForbiddenException();
          service.catch(exception, host);

          expect(logSpy).not.toHaveBeenCalledWith(exception.stack);
        });
      });
    });
  });

  describe('when the error is an UnauthorizedException', () => {
    describe('catch', () => {
      it('redirects to the login', () => {
        response = createMock<Response>();
        exception = new UnauthorizedException();

        service.catch(exception, host);

        expect(response.redirect).toHaveBeenCalledWith(302, '/login');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          const getRollbarClient = jest.spyOn(
            GlobalExceptionFilter.prototype as any,
            'getRollbarClient',
          );

          getRollbarClient.mockImplementation(() => {
            return rollbarClient;
          });

          exception = new UnauthorizedException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
          const logSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => null);

          exception = new UnauthorizedException();
          service.catch(exception, host);

          expect(logSpy).not.toHaveBeenCalledWith(exception.stack);
        });
      });
    });
  });

  describe('when the error is an InternalServerErrorException', () => {
    describe('catch', () => {
      it('renders the generic error template', () => {
        response = createMock<Response>();
        exception = new InternalServerErrorException();

        service.catch(exception, host);

        expect(response.render).toHaveBeenCalledWith('errors/generic-error');
      });

      describe('when NODE_ENV is not set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'test';
        });

        it('should not report the error to rollbar', () => {
          const getRollbarClient = jest.spyOn(
            GlobalExceptionFilter.prototype as any,
            'getRollbarClient',
          );

          getRollbarClient.mockImplementation(() => {
            return rollbarClient;
          });

          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalledWith(exception);
        });

        it('should log the error', () => {
          const logSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => null);

          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(logSpy).toHaveBeenCalledWith(exception.stack);
        });
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should report the error to rollbar', () => {
          const getRollbarClient = jest.spyOn(
            GlobalExceptionFilter.prototype as any,
            'getRollbarClient',
          );

          getRollbarClient.mockImplementation(() => {
            return rollbarClient;
          });

          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(rollbarClient.error).toHaveBeenCalledWith(exception, request);
        });

        it('should log the error', () => {
          const logSpy = jest
            .spyOn(Logger, 'error')
            .mockImplementation(() => null);

          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(logSpy).toHaveBeenCalledWith(exception.stack);
        });
      });
    });
  });
});

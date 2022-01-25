import {
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import Rollbar from 'rollbar';
import { createMock } from '@golevelup/ts-jest';

import { GlobalExceptionFilter } from './global-exception.filter';

const reponse = createMock<Response>();

const host = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getResponse: () => reponse,
  }),
});

const rollbarClient = createMock<Rollbar>({
  error: jest.fn(() => {
    return {};
  }),
});

const getRollbarClient = jest.spyOn(
  GlobalExceptionFilter.prototype as any,
  'getRollbarClient',
);

const service = new GlobalExceptionFilter();

getRollbarClient.mockImplementation(() => {
  return rollbarClient;
});

const logSpy = jest.spyOn(Logger, 'error').mockImplementation(() => null);

describe('GlobalExceptionFilter', () => {
  let exception: HttpException;

  const OLD_ENV = process.env;

  beforeEach(async () => {
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
        exception = new NotFoundException();
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/not-found');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          exception = new NotFoundException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
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
        exception = new ForbiddenException();
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/forbidden');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          exception = new ForbiddenException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
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
        exception = new UnauthorizedException();
        service.catch(exception, host);

        expect(reponse.redirect).toHaveBeenCalledWith(302, '/login');
      });

      describe('when NODE_ENV is set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'production';
        });

        it('should not report the error to rollbar', () => {
          exception = new UnauthorizedException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalled();
        });

        it('should not log the error', () => {
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
        exception = new InternalServerErrorException();
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/generic-error');
      });

      describe('when NODE_ENV is not set to production', () => {
        beforeEach(() => {
          process.env['NODE_ENV'] = 'test';
        });

        it('should report the error to rollbar', () => {
          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(rollbarClient.error).not.toHaveBeenCalledWith(exception);
        });

        it('should log the error', () => {
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
          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(rollbarClient.error).toHaveBeenCalledWith(exception);
        });

        it('should log the error', () => {
          exception = new InternalServerErrorException();
          service.catch(exception, host);

          expect(logSpy).toHaveBeenCalledWith(exception.stack);
        });
      });
    });
  });
});

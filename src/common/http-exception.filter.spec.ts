import {
  ExecutionContext,
  BadRequestException,
  HttpException,
  BadGatewayException,
  ImATeapotException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

import { createMock } from '@golevelup/ts-jest';

import { HttpExceptionFilter } from './http-exception.filter';

const reponse = createMock<Response>();

const host = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getResponse: () => reponse,
  }),
});

describe('HttpExceptionFilter', () => {
  let service: HttpExceptionFilter;
  let exception: HttpException;

  beforeEach(async () => {
    service = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when the error is a BadRequestException', () => {
    beforeEach(() => {
      exception = new BadRequestException();
    });
    describe('catch', () => {
      it('renders the generic error template', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/generic-error');
      });
    });
  });

  describe('when the error is a BadGatewayException', () => {
    beforeEach(() => {
      exception = new BadGatewayException();
    });
    describe('catch', () => {
      it('renders the generic error template', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/generic-error');
      });
    });
  });

  describe('when the error is a ImATeapotException', () => {
    beforeEach(() => {
      exception = new ImATeapotException();
    });
    describe('catch', () => {
      it('renders the generic error template', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/generic-error');
      });
    });
  });

  describe('when the error is a NotFoundException', () => {
    beforeEach(() => {
      exception = new NotFoundException();
    });
    describe('catch', () => {
      it('renders the not-found template', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/not-found');
      });
    });
  });

  describe('when the error is a ForbiddenException', () => {
    beforeEach(() => {
      exception = new ForbiddenException();
    });
    describe('catch', () => {
      it('renders the forbidden template', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('errors/forbidden');
      });
    });
  });

  describe('when the error is an UnauthorizedException', () => {
    beforeEach(() => {
      exception = new UnauthorizedException();
    });
    describe('catch', () => {
      it('redirects to the login', () => {
        service.catch(exception, host);

        expect(reponse.redirect).toHaveBeenCalledWith(302, '/login');
      });
    });
  });
});

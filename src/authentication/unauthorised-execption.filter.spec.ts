import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

import { createMock } from '@golevelup/ts-jest';

import { UnauthorizedExceptionFilter } from './unauthorised-exception.filter';

const reponse = createMock<Response>();

const exception = createMock<ForbiddenException>();
const host = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getResponse: () => reponse,
  }),
});

describe('UnauthorizedExceptionFilter', () => {
  let service: UnauthorizedExceptionFilter;

  beforeEach(async () => {
    service = new UnauthorizedExceptionFilter();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('catch', () => {
    it('redirects to the login page', () => {
      service.catch(exception, host);

      expect(reponse.redirect).toHaveBeenCalledWith(302, '/login');
    });
  });
});

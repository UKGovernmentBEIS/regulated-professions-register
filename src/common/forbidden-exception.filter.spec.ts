import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

import { createMock } from '@golevelup/ts-jest';

import { ForbiddenExceptionFilter } from './forbidden-exception.filter';

const reponse = createMock<Response>();

const exception = createMock<ForbiddenException>();
const host = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getResponse: () => reponse,
  }),
});

describe('ForbiddenExceptionFilter', () => {
  let service: ForbiddenExceptionFilter;

  beforeEach(async () => {
    service = new ForbiddenExceptionFilter();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('catch', () => {
    it('renders the forbidden template', () => {
      service.catch(exception, host);

      expect(reponse.render).toHaveBeenCalledWith('errors/forbidden');
    });
  });
});

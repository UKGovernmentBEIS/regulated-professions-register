import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

import { createMock } from '@golevelup/ts-jest';

import { ValidationExceptionFilter } from './validation-exception.filter';
import { ValidationFailedError } from './validation-failed.error';

const request = {
  url: 'http://example.com',
};

const reponse = createMock<Response>();

const exception = createMock<ValidationFailedError>();
const host = createMock<ExecutionContext>({
  switchToHttp: () => ({
    getRequest: () => request,
    getResponse: () => reponse,
  }),
});

describe('IneligibleExceptionFilter', () => {
  let service: ValidationExceptionFilter;

  beforeEach(async () => {
    service = new ValidationExceptionFilter('blog-post/new', 'blogPost');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('catch', () => {
    it('renders the template with the errors, object and url', () => {
      service.catch(exception, host);

      expect(reponse.render).toHaveBeenCalledWith('blog-post/new', {
        errors: exception.fullMessages(),
        blogPost: exception.target,
        url: request.url,
      });
    });

    describe('when the object name is not specified', () => {
      beforeEach(async () => {
        service = new ValidationExceptionFilter('blog-post/new');
      });

      it('spreads the object into the base object', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('blog-post/new', {
          ...exception.target,
          errors: exception.fullMessages(),
          url: request.url,
        });
      });
    });

    describe('when additional variables are provided', () => {
      beforeEach(async () => {
        service = new ValidationExceptionFilter('blog-post/new', 'blogPost', {
          something: 'else',
        });
      });

      it('renders the template with the errors, object, url and additional variables', () => {
        service.catch(exception, host);

        expect(reponse.render).toHaveBeenCalledWith('blog-post/new', {
          something: 'else',
          errors: exception.fullMessages(),
          blogPost: exception.target,
          url: request.url,
        });
      });
    });
  });
});

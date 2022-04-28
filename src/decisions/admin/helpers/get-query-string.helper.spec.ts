import { createMock } from '@golevelup/ts-jest';
import { Request } from 'express';
import { getQueryString } from './get-query-string.helper';

describe('getQueryString', () => {
  describe('when called with a request with a URL without query parameters', () => {
    it('returns an empty string', () => {
      const request = createMock<Request>({
        url: 'http://example.com/some/path',
      });

      expect(getQueryString(request)).toEqual('');
    });
  });

  describe('when called with a request with a URL with query parameters', () => {
    it('returns the query parameters', () => {
      const request = createMock<Request>({
        url: 'http://example.com/some/path?some&example&query=parameters',
      });

      expect(getQueryString(request)).toEqual('some&example&query=parameters');
    });
  });
});

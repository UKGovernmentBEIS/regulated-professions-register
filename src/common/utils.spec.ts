import { DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';
import { backLink, formatDate } from './utils';
import { createMockRequest } from './create-mock-request';

describe('utils', () => {
  describe('backLink', () => {
    let req: DeepMocked<Request>;
    let referrer: string;
    let host: string;

    beforeEach(() => {
      host = 'example.com';
    });

    describe('when the referrer is set', () => {
      describe('when the referrer includes the host url', () => {
        beforeEach(() => {
          referrer = 'http://example.com/some/path';
          req = createMockRequest(referrer, host);
        });

        it('returns the referrer', () => {
          expect(backLink(req)).toEqual(referrer);
        });
      });

      describe('when the referrer does not include the host url', () => {
        beforeEach(() => {
          referrer = 'http://example.org/some/path';
          req = createMockRequest(referrer, host);
        });

        it('returns undefined', () => {
          expect(backLink(req)).toBeUndefined();
        });
      });
    });

    describe('when the referrer is not set', () => {
      beforeEach(() => {
        referrer = undefined;
        req = createMockRequest(referrer, host);
      });

      it('returns undefined', () => {
        expect(backLink(req)).toBeUndefined();
      });
    });
  });

  describe('formatDate', () => {
    it('returns a date in DD-MM-YYYY format', () => {
      // Months are zero-indexed
      expect(formatDate(new Date(1999, 5, 23))).toEqual('23-06-1999');
    });
  });
});

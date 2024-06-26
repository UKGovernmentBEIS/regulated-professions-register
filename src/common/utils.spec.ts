import { DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';
import { getReferrer, formatDate, sortArrayByProperty } from './utils';
import { createMockRequest } from '../testutils/create-mock-request';
import { Industry } from 'src/industries/industry.entity';

describe('utils', () => {
  describe('getReferrer', () => {
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
          expect(getReferrer(req)).toEqual(referrer);
        });
      });

      describe('when the referrer does not include the host url', () => {
        beforeEach(() => {
          referrer = 'http://example.org/some/path';
          req = createMockRequest(referrer, host);
        });

        it('returns undefined', () => {
          expect(getReferrer(req)).toBeUndefined();
        });
      });
    });

    describe('when the referrer is not set', () => {
      beforeEach(() => {
        referrer = undefined;
        req = createMockRequest(referrer, host);
      });

      it('returns undefined', () => {
        expect(getReferrer(req)).toBeUndefined();
      });
    });
  });

  describe('formatDate', () => {
    it('returns a date in a friendly format', () => {
      // Months are zero-indexed
      expect(formatDate(new Date(1999, 5, 23))).toEqual('23 Jun 1999');
      expect(formatDate(new Date(2003, 7, 2))).toEqual('2 Aug 2003');
    });
  });

  describe('sortArrayByProperty', () => {
    it('returns an alphabetically sorted array of maps by a given key', () => {
      const industries: Industry[] = [
        {
          name: 'b',
          id: '2',
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
        },
        {
          name: 'a',
          id: '1',
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
        },
        {
          name: 'd',
          id: '4',
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
        },
        {
          name: 'c',
          id: '3',
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
        },
      ];

      const industryMap = industries.map((industry) => ({
        text: industry.name,
        value: industry.id,
      }));

      const sortedIndustryMap = sortArrayByProperty(industryMap, 'text');

      expect(sortedIndustryMap[0]['text']).toEqual('a');
      expect(sortedIndustryMap[1]['text']).toEqual('b');
      expect(sortedIndustryMap[2]['text']).toEqual('c');
      expect(sortedIndustryMap[3]['text']).toEqual('d');
    });
  });
});

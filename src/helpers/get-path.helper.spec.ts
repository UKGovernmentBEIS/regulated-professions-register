import { getPathFromReferrer } from './get-path.helper';

describe('getDomain', () => {
  describe('when given a URL string', () => {
    it('returns the path', () => {
      expect(
        getPathFromReferrer('http://www.example.com/path/to/page'),
      ).toEqual('/path/to/page');
    });
  });

  describe('when given an undefined var', () => {
    it('returns the path', () => {
      expect(getPathFromReferrer(undefined)).toEqual('/');
    });
  });
});

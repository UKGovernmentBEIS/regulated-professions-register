import { getDomain } from './get-domain.helper';

describe('getDomain', () => {
  describe('when given a http:// URL', () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://www.example.com')).toEqual('www.example.com');
    });
  });

  describe("when given a URL that doesn't being with 'www'", () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://example.com')).toEqual('example.com');
    });
  });

  describe('when given a https:// URL', () => {
    it('returns the expected domain', () => {
      expect(getDomain('https://www.example.com')).toEqual('www.example.com');
    });
  });

  describe('when given a URL with a path', () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://www.example.com/some/path')).toEqual(
        'www.example.com',
      );
    });
  });

  describe("when given a URL ending with a '/'", () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://www.example.com/')).toEqual('www.example.com');
    });
  });

  describe('when given a URL with query parameters', () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://www.example.com/some/path?key=value')).toEqual(
        'www.example.com',
      );
    });
  });

  describe('when given a URL with a port number', () => {
    it('returns the expected domain', () => {
      expect(getDomain('http://www.example.com:8000')).toEqual(
        'www.example.com',
      );
    });
  });
});

import { preprocessUrl } from './preprocess-url.helper';

describe('preprocessUrl', () => {
  describe('when the input string is not a URL', () => {
    it('returns the input string', () => {
      expect(preprocessUrl('  definitely not a URL')).toEqual(
        '  definitely not a URL',
      );
    });
  });

  describe('when the input string has an unexpected protocol', () => {
    it('returns the input string', () => {
      expect(preprocessUrl('  ftp://example.com')).toEqual(
        '  ftp://example.com',
      );
    });
  });

  describe('when the input string is missing a protocol', () => {
    it('returns the input string with a default protocol prepended', () => {
      expect(preprocessUrl('www.example.com')).toEqual(
        'http://www.example.com',
      );
    });
  });

  describe('when the input string has an expected protocol', () => {
    it('returns the input string', () => {
      expect(preprocessUrl('http://www.example.com')).toEqual(
        'http://www.example.com',
      );
      expect(preprocessUrl('https://www.example.com')).toEqual(
        'https://www.example.com',
      );
    });
  });

  describe('when the input string is a URL surrounded with whitespace', () => {
    it('returns the URL with the whitespace removed', () => {
      expect(preprocessUrl(' https://www.example.com \n')).toEqual(
        'https://www.example.com',
      );
      expect(preprocessUrl(' www.example.com \n')).toEqual(
        'http://www.example.com',
      );
    });
  });
});

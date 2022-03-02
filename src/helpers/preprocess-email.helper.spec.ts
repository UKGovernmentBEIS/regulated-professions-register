import { preprocessEmail } from './preprocess-email.helper';

describe('preprocessEmail', () => {
  describe('when the input string is not a email address', () => {
    it('returns the input string', () => {
      expect(preprocessEmail('  definitely not an email address')).toEqual(
        '  definitely not an email address',
      );
    });
  });

  describe('when the input string is an email address', () => {
    it('returns the input string', () => {
      expect(preprocessEmail('name@example.com')).toEqual('name@example.com');
    });
  });

  describe('when the input string is an email address surrounded with whitespace', () => {
    it('returns the email address with the whitespace removed', () => {
      expect(preprocessEmail(' name@example.com \n')).toEqual(
        'name@example.com',
      );
    });
  });
});

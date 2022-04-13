import { decisionValueToString } from './decision-value-to-string.helper';

describe('decisionValueToString', () => {
  describe('when given a number', () => {
    it('returns the string of the nmber', () => {
      expect(decisionValueToString(7)).toEqual('7');
    });
  });

  describe('when given null', () => {
    it('returns an empty string', () => {
      expect(decisionValueToString(null)).toEqual('');
    });
  });
});

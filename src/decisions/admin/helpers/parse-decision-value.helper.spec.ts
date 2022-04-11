import { parseDecisionValue } from './parse-decision-value.helper';

describe('parseDecisionValue', () => {
  describe('when given an empty string', () => {
    it('returns null', () => {
      expect(parseDecisionValue('')).toEqual(null);
    });
  });

  describe('when given an integer string', () => {
    it('returns that integer as a number', () => {
      expect(parseDecisionValue('295')).toEqual(295);
    });
  });

  describe('when given a padded integer string', () => {
    it('returns that integer as a number', () => {
      expect(parseDecisionValue('  34 ')).toEqual(34);
    });
  });

  describe("when given '0'", () => {
    it('returns 0', () => {
      expect(parseDecisionValue('0')).toEqual(0);
    });
  });

  describe('when given a negative integer string', () => {
    it('returns null', () => {
      expect(parseDecisionValue('-70')).toEqual(null);
    });
  });

  describe('when given a non-integer numeric string', () => {
    it('ignores everything after the decimal point', () => {
      expect(parseDecisionValue('33.9')).toEqual(33);
    });
  });

  describe('when given a non-numeric string', () => {
    it('return null', () => {
      expect(parseDecisionValue('hello')).toEqual(null);
    });
  });
});

import { parseDecisionValue } from './parse-decision-value.helper';

describe('parseDecisionValue', () => {
  describe('when zeroInvalidValues is set to false', () => {
    describe('when given an empty string', () => {
      it('returns null', () => {
        expect(parseDecisionValue('', false)).toEqual(null);
      });
    });

    describe('when given a non-numeric string', () => {
      it('return null', () => {
        expect(parseDecisionValue('hello', false)).toEqual(null);
      });
    });

    describe('when given a negative integer string', () => {
      it('returns null', () => {
        expect(parseDecisionValue('-70', false)).toEqual(null);
      });
    });
  });

  describe('when zeroInvalidValues is set to true', () => {
    describe('when given an empty string', () => {
      it('returns null', () => {
        expect(parseDecisionValue('', true)).toEqual(0);
      });
    });

    describe('when given a non-numeric string', () => {
      it('return null', () => {
        expect(parseDecisionValue('hello', true)).toEqual(0);
      });
    });

    describe('when given a negative integer string', () => {
      it('returns null', () => {
        expect(parseDecisionValue('-70', true)).toEqual(0);
      });
    });
  });

  describe('when given an integer string', () => {
    it('returns that integer as a number', () => {
      expect(parseDecisionValue('295', false)).toEqual(295);
    });
  });

  describe('when given a padded integer string', () => {
    it('returns that integer as a number', () => {
      expect(parseDecisionValue('  34 ', false)).toEqual(34);
    });
  });

  describe("when given '0'", () => {
    it('returns 0', () => {
      expect(parseDecisionValue('0', false)).toEqual(0);
    });
  });

  describe('when given a non-integer numeric string', () => {
    it('ignores everything after the decimal point', () => {
      expect(parseDecisionValue('33.9', false)).toEqual(33);
    });
  });
});

import { pad } from './pad.helper';

describe('pad', () => {
  describe('when given `null`', () => {
    it('returns an array of the given minimum length', () => {
      expect(pad(null, 3)).toEqual([undefined, undefined, undefined]);
    });
  });

  describe('when given an empty array', () => {
    it('returns an array of the given minimum length, leaving the original array unchanged', () => {
      const input = [];

      expect(pad(input, 3)).toEqual([undefined, undefined, undefined]);
      expect(input).toEqual([]);
    });
  });

  describe('when given a populated array', () => {
    describe("when the array's length equals the minimum length", () => {
      it('returns the original array, unchanged', () => {
        const input = ['one', 'two', 'three'];

        expect(pad(input, 3)).toBe(input);
        expect(input).toEqual(['one', 'two', 'three']);
      });
    });

    describe("when the array's length is greater than the minimum length", () => {
      it('returns the original array, unchanged', () => {
        const input = ['one', 'two', 'three', 'four'];

        expect(pad(input, 3)).toBe(input);
        expect(input).toEqual(['one', 'two', 'three', 'four']);
      });
    });

    describe("when the array's length is less than the minimum length", () => {
      it('returns an array padded to the minimum length, leaving the original array unchanged', () => {
        const input = ['one', 'two'];

        expect(pad(input, 3)).toEqual(['one', 'two', undefined]);
        expect(input).toEqual(['one', 'two']);
      });
    });
  });
});

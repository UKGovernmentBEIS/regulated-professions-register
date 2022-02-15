import { allNations, isUK } from './nations.helper';

describe('nations.helper', () => {
  describe('allNations', () => {
    it('returns all nations', () => {
      expect(allNations()).toEqual(['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR']);
    });
  });

  describe('isUK', () => {
    describe('when the nations list contains all UK nations', () => {
      it('returns true', () => {
        const nations = ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'];

        expect(isUK(nations)).toBeTruthy();
      });
    });

    describe('when the nations list does not contain all UK nations', () => {
      it('returns false', () => {
        const nations = ['GB-ENG', 'GB-WLS'];

        expect(isUK(nations)).toBeFalsy();
      });
    });
  });
});

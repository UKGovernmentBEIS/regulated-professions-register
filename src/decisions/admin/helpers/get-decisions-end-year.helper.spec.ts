import { getDecisionsEndYear } from './get-decisions-end-year.helper';

describe('getDecisionsEndYear', () => {
  describe('when it is the middle of the year', () => {
    it('returns the previous year', () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 6, 15));

      expect(getDecisionsEndYear()).toEqual(2023);
    });

    describe('when it is the start of the year', () => {
      it('returns the previous year', () => {
        // Months are zero-indexed
        jest.useFakeTimers().setSystemTime(new Date(2025, 0, 1));

        expect(getDecisionsEndYear()).toEqual(2024);
      });
    });

    describe('when it is the end of the year', () => {
      it('returns the previous year', () => {
        // Months are zero-indexed
        jest.useFakeTimers().setSystemTime(new Date(2026, 11, 31));

        expect(getDecisionsEndYear()).toEqual(2025);
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

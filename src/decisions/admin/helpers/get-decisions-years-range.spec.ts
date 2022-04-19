import { getDecisionsYearsRange } from './get-decisions-years-range';

describe('getDecisionsYearsRange', () => {
  describe('when it is the middle of the year', () => {
    it('returns a range from 2020 to the year before the current year', () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 6, 15));

      expect(getDecisionsYearsRange()).toEqual({ start: 2020, end: 2023 });
    });

    describe('when it is the start of the year', () => {
      it('returns a range from 2020 to the year before the current year', () => {
        // Months are zero-indexed
        jest.useFakeTimers().setSystemTime(new Date(2025, 0, 1));

        expect(getDecisionsYearsRange()).toEqual({ start: 2020, end: 2024 });
      });
    });

    describe('when it is the end of the year', () => {
      it('returns a range from 2020 to the year before the current year', () => {
        // Months are zero-indexed
        jest.useFakeTimers().setSystemTime(new Date(2026, 11, 31));

        expect(getDecisionsYearsRange()).toEqual({ start: 2020, end: 2025 });
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

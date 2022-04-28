import { getExportTimestamp } from './get-export-timestamp.helper';

describe('getExportTimestamp', () => {
  it('returns a timestamp string for the current date', () => {
    // Months are zero-indexed
    jest.useFakeTimers().setSystemTime(new Date(2024, 7, 15));

    expect(getExportTimestamp()).toEqual('20240815');
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

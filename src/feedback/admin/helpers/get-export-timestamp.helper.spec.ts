import { getExportTimestamp } from './get-export-timestamp.helper';

describe('getExportTimestamp', () => {
  it('returns a timestamp string for the current date and time', () => {
    // Months are zero-indexed
    jest.useFakeTimers().setSystemTime(new Date(2024, 7, 15, 12, 15, 32));

    expect(getExportTimestamp()).toEqual('20240815-121532');
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});

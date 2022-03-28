import { PhoneNumberUtil } from 'google-libphonenumber';
import { validateTelephone } from './validate-telephone.helper';

describe('validateTelephone', () => {
  it('returns false if the number contains characters that are neither spaces nor numerals', () => {
    expect(validateTelephone('(020) 7215 5000')).toEqual(false);
  });

  it('returns false if the number is not a valid UK number', () => {
    expect(validateTelephone('555 555')).toEqual(false);
  });

  it('returns false if the number contains a country code', () => {
    expect(validateTelephone('00 44 20 7215 5000')).toEqual(false);
  });

  it('returns false if if `libphonenumber` throws an error while parsing our number', () => {
    const mock = jest.spyOn(PhoneNumberUtil.prototype, 'parseAndKeepRawInput');
    mock.mockImplementation(() => {
      throw new Error();
    });

    expect(validateTelephone('020 7215 5000')).toEqual(false);
  });

  it('returns true if the number is a valid UK number without a country code', () => {
    expect(validateTelephone('020 7215 5000')).toEqual(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

import { PhoneNumberUtil } from 'google-libphonenumber';
import { formatTelephone } from './format-telephone.helper';
import * as preprocessTelephoneModule from './preprocess-telephone.helper';

describe('formatTelephone', () => {
  it('uses `preprocessTelephone` to preprocess a telephone number', () => {
    const mock = jest.spyOn(preprocessTelephoneModule, 'preprocessTelephone');
    formatTelephone('020 7215 5000');

    expect(mock).toBeCalledWith('020 7215 5000', false);
  });

  it('correctly formats UK numbers with unnecessary padding', () => {
    expect(formatTelephone('  020 7215 5000  ')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers without a country code', () => {
    expect(formatTelephone('020 7215 5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers with a country code and no leading 0', () => {
    expect(formatTelephone('+44 20 7215 5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers with a country code and no leading 0, without a space', () => {
    expect(formatTelephone('+4420 7215 5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers with a country code and a leading 0', () => {
    expect(formatTelephone('+44 020 7215 5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers with a country code and a leading 0, without a space', () => {
    expect(formatTelephone('+44020 7215 5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats UK numbers that use "00" instead of "+"', () => {
    expect(formatTelephone('00 44 020 7215 5000')).toEqual(
      '+44 (0)20 7215 5000',
    );
  });

  it('correctly formats UK numbers that use "00" instead of "+", without a space', () => {
    expect(formatTelephone('0044 020 7215 5000')).toEqual(
      '+44 (0)20 7215 5000',
    );
  });

  it('correctly formats UK numbers with extra brackets', () => {
    expect(formatTelephone('+44 (020) 7215 5000')).toEqual(
      '+44 (0)20 7215 5000',
    );
  });

  it('correctly formats UK numbers unnecessary decoration', () => {
    expect(formatTelephone('020.7215-5000')).toEqual('+44 (0)20 7215 5000');
  });

  it('correctly formats international numbers', () => {
    expect(formatTelephone('+55 555-555-555')).toEqual('+55 555 555 555');
  });

  it("trims numbers we can't otherwise handle", () => {
    expect(formatTelephone(' 555-CALL-NOW ')).toEqual('555-CALL-NOW');
  });

  it('trims numbers if `libphonenumber` reports our formatted number does not match the orginal number', () => {
    const mock = jest.spyOn(PhoneNumberUtil.prototype, 'isNumberMatch');
    mock.mockReturnValue(PhoneNumberUtil.MatchType.NO_MATCH);

    expect(formatTelephone(' 020 7215 5000 ')).toEqual('020 7215 5000');
  });

  it('trims numbers if `libphonenumber` throws an error while parsing our number', () => {
    const mock = jest.spyOn(PhoneNumberUtil.prototype, 'parseAndKeepRawInput');
    mock.mockImplementation(() => {
      throw new Error();
    });

    expect(formatTelephone(' 020 7215 5000 ')).toEqual('020 7215 5000');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

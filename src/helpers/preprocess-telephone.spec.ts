import { preprocessTelephone } from './preprocess-telephone.helper';
import * as validateTelephoneModule from './validate-telephone.helper';

describe('preprocessTelephone', () => {
  describe('when `revertIfInvalid` is false', () => {
    it('trims the telephone number', () => {
      expect(preprocessTelephone('  020 7215 5000  ', false)).toEqual(
        '020 7215 5000',
      );
    });

    it('removes any brackets', () => {
      expect(preprocessTelephone('(020) 7215 5000')).toEqual('020 7215 5000');
    });

    it('removes any superfluous spaces', () => {
      expect(preprocessTelephone('020   7215   5000', false)).toEqual(
        '020 7215 5000',
      );
    });

    it('replaces unnecessary decoration with spaces', () => {
      expect(preprocessTelephone('020.7215---5000', false)).toEqual(
        '020 7215 5000',
      );
    });

    it('does not call `validateTelephone`', () => {
      const mock = jest.spyOn(validateTelephoneModule, 'validateTelephone');
      preprocessTelephone('020 7215 5000', false);
      expect(mock).not.toBeCalled();
    });

    it('preprocesses even invalid numbers', () => {
      expect(preprocessTelephone('  5   55-(5) ', false)).toEqual('5 55 5');
    });
  });

  describe('when `revertIfInvalid` is true', () => {
    it('calls `validateTelephone`', () => {
      const mock = jest.spyOn(validateTelephoneModule, 'validateTelephone');
      preprocessTelephone('020 7215 5000', true);
      expect(mock).toBeCalled();
    });

    it('does not preprocesses invalid numbers', () => {
      const mock = jest.spyOn(validateTelephoneModule, 'validateTelephone');
      mock.mockReturnValue(false);

      expect(preprocessTelephone('  5   55-(5) ', true)).toEqual(
        '  5   55-(5) ',
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

import { PhoneNumber, PhoneNumberUtil } from 'google-libphonenumber';
import { preprocessTelephone } from './preprocess-telephone.helper';
import { validateTelephone } from './validate-telephone.helper';

export function formatTelephone(telephone: string): string {
  if (!telephone) {
    return '';
  }

  const preprocessedTelephone = preprocessTelephone(telephone, false);

  let localTelephone: string;

  const phoneUtil = PhoneNumberUtil.getInstance();

  let phoneNumber: PhoneNumber;

  try {
    phoneNumber = phoneUtil.parseAndKeepRawInput(preprocessedTelephone, 'gb');
  } catch (e) {
    return telephone.trim();
  }

  const countryCodeSource = phoneNumber.getCountryCodeSource();
  const countryCode = phoneNumber.getCountryCode();

  if (validateTelephone(preprocessedTelephone)) {
    localTelephone = preprocessedTelephone;
  } else if (
    countryCodeSource !== PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY
  ) {
    const startingCountryCode = new RegExp(
      `^(\\+( )?${countryCode}|00( )?${countryCode})( )?`,
      'g',
    );
    localTelephone = preprocessedTelephone.replace(startingCountryCode, '');
  } else {
    return telephone.trim();
  }

  let formattedTelephone: string;
  if (countryCode === 44) {
    if (localTelephone.startsWith('0')) {
      formattedTelephone = `+44 (0)${localTelephone.substring(1)}`;
    } else {
      formattedTelephone = `+44 (0)${localTelephone}`;
    }
  } else {
    formattedTelephone = `+${countryCode} ${localTelephone}`;
  }

  const match = phoneUtil.isNumberMatch(telephone, formattedTelephone);
  if (
    match !== PhoneNumberUtil.MatchType.NO_MATCH &&
    match !== PhoneNumberUtil.MatchType.NOT_A_NUMBER
  ) {
    return formattedTelephone;
  } else {
    return telephone.trim();
  }
}

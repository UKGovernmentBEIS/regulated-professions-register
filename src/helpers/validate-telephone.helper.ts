import { PhoneNumber, PhoneNumberUtil } from 'google-libphonenumber';

export function validateTelephone(telephone: string): boolean {
  if (!telephone.match(/^[0-9 ]*$/)) {
    return false;
  }

  const phoneUtil = PhoneNumberUtil.getInstance();

  let phoneNumber: PhoneNumber;

  try {
    phoneNumber = phoneUtil.parseAndKeepRawInput(telephone, 'gb');
  } catch (e) {
    return false;
  }

  if (!phoneUtil.isValidNumberForRegion(phoneNumber, 'gb')) {
    return false;
  }

  const countryCodeSource = phoneNumber.getCountryCodeSource();
  if (
    countryCodeSource !== PhoneNumber.CountryCodeSource.FROM_DEFAULT_COUNTRY
  ) {
    return false;
  }

  return true;
}

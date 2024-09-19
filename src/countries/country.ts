import { I18nService } from 'nestjs-i18n';

export class Country {
  private static allCountries: readonly Country[];
  private static allCountriesByCode: Map<string, Country>;

  readonly name: string;
  readonly code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.code = code;
  }

  translatedName(i18nService: I18nService): string {
    return i18nService.translate<string>(this.name) as string;
  }

  static all(): readonly Country[] {
    if (!this.allCountries) {
      const rawCountries: {
        name: string;
        code: string;
        // eslint-disable-next-line @typescript-eslint/no-require-imports
      }[] = require('../config/countries.json');

      Country.allCountries = rawCountries.map(
        (rawCountry) => new Country(rawCountry.name, rawCountry.code),
      );
    }

    return Country.allCountries;
  }

  static find(code: string): Country {
    if (!this.allCountriesByCode) {
      Country.allCountriesByCode = new Map();
      this.all().forEach((country) => {
        this.allCountriesByCode.set(country.code, country);
      });
    }

    const selectedCountry = this.allCountriesByCode.get(code);

    if (!selectedCountry) {
      throw new Error('Could not find requested Country');
    }

    return selectedCountry;
  }
}

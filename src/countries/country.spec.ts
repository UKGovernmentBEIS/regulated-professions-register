import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { translationOf } from '../testutils/translation-of';
import { Country } from './country';

describe(Country, () => {
  describe('all', () => {
    it('returns all countries in the Countries config file', () => {
      const all = Country.all();
      const uniqueCodes = [...new Set(all.map((country) => country.code))];

      const expectCountries = 195;

      expect(all).toHaveLength(expectCountries);
      expect(uniqueCodes).toHaveLength(expectCountries);
    });
  });

  describe('find', () => {
    describe('when a Country exists with the requested code in the Country config', () => {
      it('returns that Country', () => {
        expect(Country.find('NO')).toEqual(new Country('countries.no', 'NO'));
      });
    });

    describe('when a Country with the requested code does not exist in the Countries config', () => {
      it('throws an error', () => {
        expect(() => {
          Country.find('nothing');
        }).toThrow('Could not find requested Country');
      });
    });
  });

  describe('translatedName', () => {
    it('calls the translation service to return a translated version of the name', async () => {
      const country = new Country('countries.gr', 'GR');

      const i18nService = createMockI18nService();

      await expect(country.translatedName(i18nService)).toEqual(
        translationOf('countries.gr'),
      );
      expect(i18nService.translate).toHaveBeenCalledWith('countries.gr');
    });
  });
});

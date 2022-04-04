import * as stringifyNationsModule from '../nations/helpers/stringifyNations';
import { Nation } from '../nations/nation';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import professionFactory from '../testutils/factories/profession';
import { allNations, getNationsFromProfessions, isUK } from './nations.helper';

describe('nations.helper', () => {
  describe('allNations', () => {
    it('returns all nations', () => {
      expect(allNations()).toEqual(['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR']);
    });
  });

  describe('isUK', () => {
    describe('when the nations list contains all UK nations', () => {
      it('returns true', () => {
        const nations = ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'];

        expect(isUK(nations)).toBeTruthy();
      });
    });

    describe('when the nations list does not contain all UK nations', () => {
      it('returns false', () => {
        const nations = ['GB-ENG', 'GB-WLS'];

        expect(isUK(nations)).toBeFalsy();
      });
    });
  });

  describe('getNationsFromProfession', () => {
    it('joins the nations on the given professions', async () => {
      const i18nService = createMockI18nService();
      const profession1NationCodes = ['GB-ENG', 'GB-WLS'];
      const profession2NationCodes = ['GB-SCT'];

      const england = new Nation('nations.england', 'GB-ENG');
      const wales = new Nation('nations.wales', 'GB-WLS');
      const scotland = new Nation('nations.scotland', 'GB-SCT');

      jest.spyOn(Nation, 'all').mockReturnValue([england, scotland, wales]);

      const professions = [
        professionFactory.build({
          occupationLocations: profession1NationCodes,
        }),
        professionFactory.build({
          occupationLocations: profession2NationCodes,
        }),
      ];

      const stringifyNationsSpy = jest.spyOn(
        stringifyNationsModule,
        'stringifyNations',
      );

      await getNationsFromProfessions(professions, i18nService);

      expect(stringifyNationsSpy).toHaveBeenCalledWith(
        [england, wales, scotland],
        i18nService,
      );
    });

    it('removes duplicate nations', async () => {
      const i18nService = createMockI18nService();
      const profession1NationCodes = ['GB-ENG', 'GB-WLS'];
      const profession2NationCodes = ['GB-SCT', 'GB-ENG'];

      const england = new Nation('nations.england', 'GB-ENG');
      const wales = new Nation('nations.wales', 'GB-WLS');
      const scotland = new Nation('nations.scotland', 'GB-SCT');

      jest.spyOn(Nation, 'all').mockReturnValue([england, scotland, wales]);

      const professions = [
        professionFactory.build({
          occupationLocations: profession1NationCodes,
        }),
        professionFactory.build({
          occupationLocations: profession2NationCodes,
        }),
      ];

      const stringifyNationsSpy = jest.spyOn(
        stringifyNationsModule,
        'stringifyNations',
      );

      await getNationsFromProfessions(professions, i18nService);

      expect(stringifyNationsSpy).toHaveBeenCalledWith(
        [england, wales, scotland],
        i18nService,
      );
    });
  });
});

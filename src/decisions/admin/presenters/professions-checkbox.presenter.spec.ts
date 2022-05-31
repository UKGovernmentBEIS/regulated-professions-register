import { ProfessionsCheckboxPresenter } from './professions-checkbox.presenter';
import professionFactory from '../../../testutils/factories/profession';

describe('ProfessionsCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    it('returns professions with the correct "checked" property value', () => {
      const profession1 = professionFactory.build({
        name: 'Profession1',
        id: 'profession-1',
      });
      const profession2 = professionFactory.build({
        name: 'Profession2',
        id: 'profession-2',
      });
      const profession3 = professionFactory.build({
        name: 'Profession3',
        id: 'profession-3',
      });

      const actual = new ProfessionsCheckboxPresenter(
        [profession1, profession2, profession3],
        [profession1, profession3],
      ).checkboxItems();

      expect(actual).toEqual([
        {
          text: 'Profession1',
          value: 'profession-1',
          checked: true,
        },
        {
          text: 'Profession2',
          value: 'profession-2',
          checked: false,
        },
        {
          text: 'Profession3',
          value: 'profession-3',
          checked: true,
        },
      ]);
    });
    it('returns checked value of false for all profession when passed an empty checkedProfessions array', () => {
      const profession1 = professionFactory.build({
        name: 'Profession1',
        id: 'profession-1',
      });
      const profession2 = professionFactory.build({
        name: 'Profession2',
        id: 'profession-2',
      });

      const actual = new ProfessionsCheckboxPresenter(
        [profession1, profession2],
        [],
      ).checkboxItems();

      expect(actual).toEqual([
        {
          text: 'Profession1',
          value: 'profession-1',
          checked: false,
        },
        {
          text: 'Profession2',
          value: 'profession-2',
          checked: false,
        },
      ]);
    });
  });
});

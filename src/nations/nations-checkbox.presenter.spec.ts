import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Nation } from './nation';
import { NationsCheckboxPresenter } from './nations-checkbox.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { translationOf } from '../testutils/translation-of';

describe('NationsCheckboxPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMockI18nService({
      'nations.england': 'England',
      'nations.scotland': 'Scotland',
      'nations.wales': 'Wales',
      'nations.northernIreland': 'Northern Ireland',
    });
  });

  describe('checkboxItems', () => {
    it('should return unchecked checkbox arguments when called with an empty list of Nations', () => {
      const presenter = new NationsCheckboxPresenter(
        Nation.all(),
        [],
        i18nService,
      );

      expect(presenter.checkboxItems()).toEqual([
        {
          text: 'England',
          value: 'GB-ENG',
          checked: false,
        },
        {
          text: 'Northern Ireland',
          value: 'GB-NIR',
          checked: false,
        },
        {
          text: 'Scotland',
          value: 'GB-SCT',
          checked: false,
        },
        {
          text: 'Wales',
          value: 'GB-WLS',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of Nations', () => {
      const nations = Nation.all();
      const presenter = new NationsCheckboxPresenter(
        nations,
        [nations[0], nations[2]],
        i18nService,
      );

      expect(presenter.checkboxItems()).toEqual([
        {
          text: 'England',
          value: 'GB-ENG',
          checked: true,
        },
        {
          text: 'Northern Ireland',
          value: 'GB-NIR',
          checked: false,
        },
        {
          text: 'Scotland',
          value: 'GB-SCT',
          checked: false,
        },
        {
          text: 'Wales',
          value: 'GB-WLS',
          checked: true,
        },
      ]);
    });
  });

  describe('checkboxArgs', () => {
    it('should return arguments for a group of checkboxes', () => {
      const presenter = new NationsCheckboxPresenter(
        Nation.all(),
        [],
        i18nService,
      );

      expect(presenter.checkboxArgs('foo', 'foo[]', 'abc.123')).toEqual({
        name: 'foo[]',
        hint: {
          text: translationOf('abc.123'),
        },
        idPrefix: 'foo',
        items: [
          {
            text: 'England',
            value: 'GB-ENG',
            checked: false,
          },
          {
            text: 'Northern Ireland',
            value: 'GB-NIR',
            checked: false,
          },
          {
            text: 'Scotland',
            value: 'GB-SCT',
            checked: false,
          },
          {
            text: 'Wales',
            value: 'GB-WLS',
            checked: false,
          },
        ],
      });
    });
  });
});

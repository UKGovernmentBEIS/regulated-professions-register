import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Nation } from './nation';
import { NationsCheckboxPresenter } from './nations-checkbox.presenter';

describe('NationsCheckboxPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'nations.england':
          return 'England';
        case 'nations.scotland':
          return 'Scotland';
        case 'nations.wales':
          return 'Wales';
        case 'nations.northernIreland':
          return 'Northern Ireland';
        default:
          return '';
      }
    });
  });

  describe('checkboxArgs', () => {
    it('should return unchecked checkbox arguments when called with an empty list of Nations', async () => {
      const presenter = new NationsCheckboxPresenter(
        Nation.all(),
        [],
        i18nService,
      );

      expect(presenter.checkboxArgs()).resolves.toEqual([
        {
          text: 'England',
          value: 'GB-ENG',
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
        {
          text: 'Northern Ireland',
          value: 'GB-NIR',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of Nations', async () => {
      const nations = Nation.all();
      const presenter = new NationsCheckboxPresenter(
        nations,
        [nations[0], nations[2]],
        i18nService,
      );

      expect(presenter.checkboxArgs()).resolves.toEqual([
        {
          text: 'England',
          value: 'GB-ENG',
          checked: true,
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
        {
          text: 'Northern Ireland',
          value: 'GB-NIR',
          checked: false,
        },
      ]);
    });
  });
});

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Industry } from '../../industries/industry.entity';
import { Profession } from '../profession.entity';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';

describe('ProfessionSearchResultPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'industries.health':
          return 'Health';
        case 'industries.law':
          return 'Law';
        case 'nations.england':
          return 'England';
        case 'nations.scotland':
          return 'Scotland';
        case 'nations.wales':
          return 'Wales';
        case 'nations.northernIreland':
          return 'Northern Ireland';
        case 'app.unitedKingdom':
          return 'United Kingdom';
        default:
          return '';
      }
    });
  });

  describe('present', () => {
    it('Returns a ProfessionSearchResultTemplate', async () => {
      const exampleProfession = new Profession(
        'Example Profession',
        '',
        'example-profession',
      );
      exampleProfession.occupationLocations = ['GB-ENG', 'GB-WLS'];
      exampleProfession.industries = [
        new Industry('industries.health'),
        new Industry('industries.law'),
      ];

      const result = await new ProfessionSearchResultPresenter(
        exampleProfession,
      ).present(i18nService);

      expect(result).toEqual({
        name: 'Example Profession',
        slug: 'example-profession',
        nations: 'England, Wales',
        industries: ['Health', 'Law'],
      });
    });

    it('Collapses four nations into "United Kingdom"', async () => {
      const exampleProfession = new Profession(
        'Example Profession',
        '',
        'example-profession',
      );
      exampleProfession.occupationLocations = [
        'GB-WLS',
        'GB-SCT',
        'GB-ENG',
        'GB-NIR',
      ];
      exampleProfession.industries = [
        new Industry('industries.health'),
        new Industry('industries.law'),
      ];

      const result = await new ProfessionSearchResultPresenter(
        exampleProfession,
      ).present(i18nService);

      expect(result).toEqual({
        name: 'Example Profession',
        slug: 'example-profession',
        nations: 'United Kingdom',
        industries: ['Health', 'Law'],
      });
    });
  });
});

import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';

describe('ProfessionSearchResultPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMockI18nService();
  });

  describe('present', () => {
    it('Returns a ProfessionSearchResultTemplate', async () => {
      const exampleProfession = professionFactory.build({
        name: 'Example Profession',
        slug: 'example-profession',
        organisation: organisationFactory.build({
          name: 'Example Organisation',
        }),
        occupationLocations: ['GB-ENG', 'GB-WLS'],
        industries: [
          industryFactory.build({ id: 'industries.health', name: 'health' }),
          industryFactory.build({ id: 'industries.law', name: 'law' }),
        ],
      });

      const result = await new ProfessionSearchResultPresenter(
        exampleProfession,
        i18nService,
      ).present();

      expect(result).toEqual({
        name: 'Example Profession',
        slug: 'example-profession',
        organisation: 'Example Organisation',
        nations: `${translationOf('nations.england')}, ${translationOf(
          'nations.wales',
        )}`,
        industries: [translationOf('health'), translationOf('law')],
      });
    });
  });
});

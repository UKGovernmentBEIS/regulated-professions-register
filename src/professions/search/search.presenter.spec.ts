import { DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockRequest } from '../../testutils/create-mock-request';
import { Nation } from '../../nations/nation';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { SearchPresenter } from './search.presenter';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';
import industryFactory from '../../testutils/factories/industry';
import professionFactory from '../../testutils/factories/profession';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { IndexTemplate } from './interfaces/index-template.interface';

const industry1 = industryFactory.build({
  name: 'industries.example1',
  id: 'example-industry-1',
});
const industry2 = industryFactory.build({
  name: 'industries.example2',
  id: 'example-industry-2',
});
const industry3 = industryFactory.build({
  name: 'industries.example3',
  id: 'example-industry-3',
});

const professionA = professionFactory.build({
  name: 'Example Profession A',
  occupationLocations: ['GB-ENG'],
  industries: [industry1],
});
const professionB = professionFactory.build({
  name: 'Example Profession B',
  occupationLocations: ['GB-SCT', 'GB-WLS'],
  industries: [industry2, industry3],
});
const professionC = professionFactory.build({
  name: 'Example Profession C',
  occupationLocations: ['GB-NIR'],
  industries: [industry2, industry3],
});

const industries = [industry1, industry2, industry3];

describe('SearchPresenter', () => {
  let request: DeepMocked<Request>;
  let i18nService: DeepMocked<I18nService>;
  let nations: Nation[];

  beforeEach(() => {
    request = createMockRequest('http://example.com/some/path', 'example.com');

    i18nService = createMockI18nService();

    nations = Nation.all();
  });

  describe('present', () => {
    it('should return a IndexTemplate', async () => {
      const filterInput: FilterInput = {
        nations: [nations[0]],
        industries: [industry2],
        keywords: 'Example Keywords',
      };

      const presenter = new SearchPresenter(
        filterInput,
        nations,
        industries,
        // Intentionally mis-ordered to exercise sorting
        [professionC, professionA, professionB],
        i18nService,
        request,
      );

      const result = await presenter.present();

      const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
        industries,
        [industry2],
        i18nService,
      ).checkboxArgs();

      const nationsCheckboxArgs = await new NationsCheckboxPresenter(
        Nation.all(),
        [Nation.find('GB-ENG')],
        i18nService,
      ).checkboxArgs();

      expect(result).toMatchObject({
        filters: {
          industries: ['industries.example2'],
          keywords: 'Example Keywords',
          nations: ['nations.england'],
        },
        industriesCheckboxArgs,
        nationsCheckboxArgs,
        professions: [
          await new ProfessionSearchResultPresenter(
            professionA,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            professionB,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            professionC,
            i18nService,
          ).present(),
        ],
      } as IndexTemplate);
    });
  });
});

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockRequest } from '../../common/create-mock-request';
import { Nation } from '../../nations/nation';
import { Industry } from '../../industries/industry.entity';
import { Profession } from '../profession.entity';
import { FilterInput } from './interfaces/filter-input.interface';
import { SearchPresenter } from './search.presenter';
import { IndustriesCheckboxPresenter } from '../../industries/industries-checkbox.presenter';
import { NationsCheckboxPresenter } from '../../nations/nations-checkbox.presenter';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';

const exampleIndustry1 = new Industry('industries.example1');
exampleIndustry1.id = 'example-industry-1';

const exampleIndustry2 = new Industry('industries.example2');
exampleIndustry2.id = 'example-industry-2';

const exampleIndustry3 = new Industry('industries.example3');
exampleIndustry3.id = 'example-industry-3';

const exampleProfessionA = new Profession(
  'Example Profession A',
  '',
  null,
  '',
  ['GB-ENG'],
  '',
  null,
  [exampleIndustry1],
);

const exampleProfessionB = new Profession(
  'Example Profession B',
  '',
  null,
  '',
  ['GB-SCT', 'GB-WLS'],
  '',
  null,
  [exampleIndustry2, exampleIndustry3],
);

const exampleProfessionC = new Profession(
  'Example Profession C',
  '',
  null,
  '',
  ['GB-NIR'],
  '',
  null,
  [exampleIndustry2, exampleIndustry3],
);

const exampleIndustries = [
  exampleIndustry1,
  exampleIndustry2,
  exampleIndustry3,
];

describe('SearchPresenter', () => {
  let request: DeepMocked<Request>;
  let i18nService: DeepMocked<I18nService>;
  let nations: Nation[];

  beforeEach(() => {
    request = createMockRequest('http://example.com/some/path', 'example.com');
    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'industries.example1':
          return 'Example industry 1';
        case 'industries.example2':
          return 'Example industry 2';
        case 'industries.example3':
          return 'Example industry 3';
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

    nations = Nation.all();
  });

  describe('present', () => {
    it('should return a IndexTemplate', async () => {
      const filterInput: FilterInput = {
        nations: [nations[0]],
        industries: [exampleIndustry2],
        keywords: 'Example Keywords',
      };

      const presenter = new SearchPresenter(
        filterInput,
        nations,
        exampleIndustries,
        // Intentionally mis-ordered to exercise sorting
        [exampleProfessionC, exampleProfessionA, exampleProfessionB],
        i18nService,
        request,
      );

      const result = await presenter.present();

      const industriesCheckboxArgs = await new IndustriesCheckboxPresenter(
        exampleIndustries,
        [exampleIndustry2],
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
            exampleProfessionA,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            exampleProfessionB,
            i18nService,
          ).present(),
          await new ProfessionSearchResultPresenter(
            exampleProfessionC,
            i18nService,
          ).present(),
        ],
      });
    });
  });
});

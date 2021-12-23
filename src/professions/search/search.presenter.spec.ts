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

const exampleProfession1 = new Profession(
  'Example Profession 1',
  '',
  null,
  '',
  ['GB-ENG'],
  '',
  null,
  [exampleIndustry1],
);

const exampleProfession2 = new Profession(
  'Example Profession 2',
  '',
  null,
  '',
  ['GB-SCT', 'GB-WLS'],
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
        [exampleProfession1, exampleProfession2],
      );

      const result = await presenter.present(i18nService, request);

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
          await new ProfessionSearchResultPresenter(exampleProfession1).present(
            i18nService,
          ),
          await new ProfessionSearchResultPresenter(exampleProfession2).present(
            i18nService,
          ),
        ],
      });
    });

    it('should sort the search results alphabetically', async () => {
      const filterInput: FilterInput = {
        nations: [],
        industries: [],
        keywords: '',
      };

      const professionA = new Profession('A');
      professionA.occupationLocations = [];
      professionA.industries = [];

      const professionB = new Profession('B');
      professionB.occupationLocations = [];
      professionB.industries = [];

      const professionC = new Profession('C');
      professionC.occupationLocations = [];
      professionC.industries = [];

      const presenter = new SearchPresenter(
        filterInput,
        nations,
        exampleIndustries,
        [professionC, professionA, professionB],
      );

      const result = await presenter.present(i18nService, request);

      expect(result).toMatchObject({
        professions: [
          await new ProfessionSearchResultPresenter(professionA).present(
            i18nService,
          ),
          await new ProfessionSearchResultPresenter(professionB).present(
            i18nService,
          ),
          await new ProfessionSearchResultPresenter(professionC).present(
            i18nService,
          ),
        ],
      });
    });
  });
});

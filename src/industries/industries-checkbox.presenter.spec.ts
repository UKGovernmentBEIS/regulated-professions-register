import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { IndustriesCheckboxPresenter } from './industries-checkbox.presenter';
import { Industry } from './industry.entity';

const exampleIndustry1 = new Industry('industries.example1');
exampleIndustry1.id = 'example-industry-1';

const exampleIndustry2 = new Industry('industries.example2');
exampleIndustry2.id = 'example-industry-2';

const exampleIndustry3 = new Industry('industries.example3');
exampleIndustry3.id = 'example-industry-3';

const exampleIndustries = [
  exampleIndustry1,
  exampleIndustry2,
  exampleIndustry3,
];

describe('IndustriesCheckboxPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'industries.example1':
          return 'Example Industry 1';
        case 'industries.example2':
          return 'Example Industry 2';
        case 'industries.example3':
          return 'Example Industry 3';
        default:
          return '';
      }
    });
  });

  describe('checkboxArgs', () => {
    it('should return unchecked checkbox arguments when called with an empty list of checked Indutries', () => {
      const presenter = new IndustriesCheckboxPresenter(
        exampleIndustries,
        [],
        i18nService,
      );

      expect(presenter.checkboxArgs()).resolves.toEqual([
        {
          text: 'Example Industry 1',
          value: 'example-industry-1',
          checked: false,
        },
        {
          text: 'Example Industry 2',
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: 'Example Industry 3',
          value: 'example-industry-3',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of checked Industries', () => {
      const presenter = new IndustriesCheckboxPresenter(
        exampleIndustries,
        [exampleIndustry1, exampleIndustry3],
        i18nService,
      );

      expect(presenter.checkboxArgs()).resolves.toEqual([
        {
          text: 'Example Industry 1',
          value: 'example-industry-1',
          checked: true,
        },
        {
          text: 'Example Industry 2',
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: 'Example Industry 3',
          value: 'example-industry-3',
          checked: true,
        },
      ]);
    });
  });
});

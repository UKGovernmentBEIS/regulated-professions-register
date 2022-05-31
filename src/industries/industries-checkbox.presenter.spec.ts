import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industry from '../testutils/factories/industry';
import { translationOf } from '../testutils/translation-of';
import { IndustriesCheckboxPresenter } from './industries-checkbox.presenter';

describe('IndustriesCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    it('should return unchecked checkbox arguments when called with an empty list of checked Industries', () => {
      const exampleIndustry1 = industry.build({
        name: 'industries.example1',
        id: 'example-industry-1',
      });

      const exampleIndustry2 = industry.build({
        name: 'industries.example2',
        id: 'example-industry-2',
      });

      const exampleIndustry3 = industry.build({
        name: 'industries.example3',
        id: 'example-industry-3',
      });

      const presenter = new IndustriesCheckboxPresenter(
        [exampleIndustry1, exampleIndustry2, exampleIndustry3],
        [],
        createMockI18nService(),
      );

      expect(presenter.checkboxItems()).toEqual([
        {
          text: translationOf('industries.example1'),
          value: 'example-industry-1',
          checked: false,
        },
        {
          text: translationOf('industries.example2'),
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: translationOf('industries.example3'),
          value: 'example-industry-3',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of checked Industries', () => {
      const exampleIndustry1 = industry.build({
        name: 'industries.example1',
        id: 'example-industry-1',
      });

      const exampleIndustry2 = industry.build({
        name: 'industries.example2',
        id: 'example-industry-2',
      });

      const exampleIndustry3 = industry.build({
        name: 'industries.example3',
        id: 'example-industry-3',
      });

      const presenter = new IndustriesCheckboxPresenter(
        [exampleIndustry1, exampleIndustry2, exampleIndustry3],
        [exampleIndustry1, exampleIndustry3],
        createMockI18nService(),
      );

      expect(presenter.checkboxItems()).toEqual([
        {
          text: translationOf('industries.example1'),
          value: 'example-industry-1',
          checked: true,
        },
        {
          text: translationOf('industries.example2'),
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: translationOf('industries.example3'),
          value: 'example-industry-3',
          checked: true,
        },
      ]);
    });

    describe('if there is an  "other" industry', () => {
      it('should be placed at the end of the list', () => {
        const exampleIndustry1 = industry.build({
          name: 'industries.example1',
          id: 'example-industry-1',
        });

        const exampleIndustry2 = industry.build({
          name: 'industries.example2',
          id: 'example-industry-2',
        });

        const otherIndustry = industry.build({
          name: 'industries.other',
          id: 'other-industry',
        });

        const presenter = new IndustriesCheckboxPresenter(
          [otherIndustry, exampleIndustry1, exampleIndustry2],
          [otherIndustry],
          createMockI18nService(),
        );

        expect(presenter.checkboxItems()).toEqual([
          {
            text: translationOf('industries.example1'),
            value: 'example-industry-1',
            checked: false,
          },
          {
            text: translationOf('industries.example2'),
            value: 'example-industry-2',
            checked: false,
          },
          {
            text: translationOf('industries.other'),
            value: 'other-industry',
            checked: true,
          },
        ]);
      });
    });
  });
});

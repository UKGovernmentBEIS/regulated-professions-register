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
  describe('checkboxArgs', () => {
    it('should return unchecked checkbox arguments when called with one argument', () => {
      const presenter = new IndustriesCheckboxPresenter(exampleIndustries);

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'industries.example1',
          value: 'example-industry-1',
          checked: false,
        },
        {
          text: 'industries.example2',
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: 'industries.example3',
          value: 'example-industry-3',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with two arguments', () => {
      const presenter = new IndustriesCheckboxPresenter(exampleIndustries, [
        exampleIndustry1,
        exampleIndustry3,
      ]);

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'industries.example1',
          value: 'example-industry-1',
          checked: true,
        },
        {
          text: 'industries.example2',
          value: 'example-industry-2',
          checked: false,
        },
        {
          text: 'industries.example3',
          value: 'example-industry-3',
          checked: true,
        },
      ]);
    });
  });
});

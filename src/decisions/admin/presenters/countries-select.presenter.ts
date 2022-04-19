import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

const countries = [
  'France',
  'Belgium',
  'Brazil',
  'Japan',
  'Morocco',
  'Poland',
  'Germany',
  'Italy',
  'Canada',
];

export class CountriesSelectPresenter {
  constructor(private readonly selectedCountry: string | null) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: '--- Please Select ---',
        value: '',
        selected: null,
      },
    ];

    countries.forEach((country) => {
      options.push({
        text: country,
        value: country,
        selected: this.selectedCountry
          ? this.selectedCountry === country
          : false,
      });
    });

    return options;
  }
}

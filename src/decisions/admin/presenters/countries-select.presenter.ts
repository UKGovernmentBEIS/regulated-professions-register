import { I18nService } from 'nestjs-i18n';
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
  constructor(
    private readonly selectedCountry: string | null,
    private readonly i18nService: I18nService,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect'),
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

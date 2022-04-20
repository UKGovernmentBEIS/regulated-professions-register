import { I18nService } from 'nestjs-i18n';
import { SelectItemArgs } from '../../common/interfaces/select-item-args.interface';
import { Country } from '../country';

export class CountriesSelectPresenter {
  constructor(
    private readonly allCountries: readonly Country[],
    private readonly selectedCountry: Country | null,
    private readonly i18nService: I18nService,
  ) {}

  selectArgs(): SelectItemArgs[] {
    return [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect'),
        value: '',
        selected: null,
      },
      ...this.allCountries.map((country) =>
        this.countryToSelectItemArgs(country),
      ),
    ];
  }

  private countryToSelectItemArgs(country: Country): SelectItemArgs {
    return {
      text: this.i18nService.translate<string>(country.name),
      value: country.code,
      selected: this.selectedCountry
        ? this.selectedCountry.code === country.code
        : false,
    };
  }
}

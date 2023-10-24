import { I18nService } from 'nestjs-i18n';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export class YearsSelectPresenter {
  constructor(
    private readonly startYear: number,
    private readonly endYear: number,
    private readonly selectedYear: number | null,
    private readonly i18nService: I18nService,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect') as string,
        value: '',
        selected: null,
      },
    ];

    for (let year = this.startYear; year <= this.endYear; year++) {
      options.push({
        text: year.toString(),
        value: year.toString(),
        selected: this.selectedYear === year,
      });
    }

    return options;
  }
}

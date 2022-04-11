import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';

export class YearsSelectPresenter {
  constructor(
    private readonly startYear: number,
    private readonly endYear: number,
    private readonly selectedYear: number | null,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: '--- Please Select ---',
        value: '',
        selected: null,
      },
    ];

    for (let year = this.startYear; year <= this.endYear; year++) {
      options.push({
        text: year.toString(),
        value: year.toString(),
        selected:
          typeof this.selectedYear === 'number'
            ? this.selectedYear === year
            : false,
      });
    }

    return options;
  }
}

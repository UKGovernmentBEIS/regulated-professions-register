import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';

export class YearsCheckboxPresenter {
  constructor(
    private readonly startYear: number,
    private readonly endYear: number,
    private readonly checkedYears: number[],
  ) {}

  checkboxItems(): CheckboxItems[] {
    const checkboxItems: CheckboxItems[] = [];

    for (let year = this.startYear; year <= this.endYear; year++) {
      checkboxItems.push({
        text: year.toString(),
        value: year.toString(),
        checked: this.checkedYears.includes(year),
      });
    }

    return checkboxItems;
  }
}

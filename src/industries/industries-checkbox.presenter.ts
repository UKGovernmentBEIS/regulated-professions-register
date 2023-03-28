import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { Industry } from './industry.entity';

export class IndustriesCheckboxPresenter {
  constructor(
    private readonly allIndustries: Industry[],
    private readonly checkedIndustries: Industry[],
    private readonly i18nService: I18nService,
  ) {}
  checkboxItems(): CheckboxItems[] {
    let industries: Industry[];

    const other = this.allIndustries.find(
      (industry) => industry.name === 'industries.other',
    );

    const standardIndustries = this.allIndustries.filter(
      (industry) => industry.name !== 'industries.other',
    );

    if (other) {
      industries = [...standardIndustries, other];
    } else {
      industries = standardIndustries;
    }

    return industries.map((industry) => ({
      text: this.i18nService.translate<string>(industry.name) as string,
      value: industry.id,
      checked: !!this.checkedIndustries.find(
        (checkedIndustry) => checkedIndustry.id === industry.id,
      ),
    }));
  }
}

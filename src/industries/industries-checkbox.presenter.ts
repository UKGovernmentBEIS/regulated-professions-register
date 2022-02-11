import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { Industry } from './industry.entity';

export class IndustriesCheckboxPresenter {
  constructor(
    private readonly allIndustries: Industry[],
    private readonly checkedIndustries: Industry[],
    private readonly i18nService: I18nService,
  ) {}
  async checkboxItems(): Promise<CheckboxItems[]> {
    return Promise.all(
      this.allIndustries.map(async (industry) => ({
        text: await this.i18nService.translate(industry.name),
        value: industry.id,
        checked: !!this.checkedIndustries.find(
          (checkedIndustry) => checkedIndustry.id === industry.id,
        ),
      })),
    );
  }
}

import { I18nService } from 'nestjs-i18n';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Industry } from './industry.entity';

export class IndustriesCheckboxPresenter {
  constructor(
    private readonly allIndustries: Industry[],
    private readonly checkedIndustries: Industry[],
    private readonly i18nService: I18nService,
  ) {}
  async checkboxArgs(): Promise<CheckboxArgs[]> {
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

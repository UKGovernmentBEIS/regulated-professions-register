import { I18nService } from 'nestjs-i18n';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Industry } from './industry.entity';

export class IndustriesCheckboxPresenter {
  constructor(
    private readonly allIndustires: Industry[],
    private readonly checkedIndustries: Industry[] = [],
  ) {}

  async checkboxArgs(i18nService: I18nService): Promise<CheckboxArgs[]> {
    return Promise.all(
      this.allIndustires.map(async (industry) => ({
        text: await i18nService.translate(industry.name),
        value: industry.id,
        checked: !!this.checkedIndustries.find(
          (checkedIndustry) => checkedIndustry.id === industry.id,
        ),
      })),
    );
  }
}

import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Industry } from './industry.entity';

export class IndustriesCheckboxPresenter {
  constructor(
    private readonly allIndustires: Industry[],
    private readonly checkedIndustries: Industry[] = [],
  ) {}

  checkboxArgs(): CheckboxArgs[] {
    return this.allIndustires.map((industry) => ({
      text: industry.name,
      value: industry.id,
      checked: !!this.checkedIndustries.find(
        (checkedIndustry) => checkedIndustry.id === industry.id,
      ),
    }));
  }
}

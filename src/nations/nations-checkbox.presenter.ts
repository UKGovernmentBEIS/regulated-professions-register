import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[] = [],
  ) {}

  checkboxArgs(): CheckboxArgs[] {
    return this.allNations.map((nation) => ({
      text: nation.name,
      value: nation.code,
      checked: !!this.checkedNations.find(
        (checkedNation) => checkedNation.code === nation.code,
      ),
    }));
  }
}

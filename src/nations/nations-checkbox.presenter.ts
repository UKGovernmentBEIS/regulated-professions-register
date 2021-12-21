import { I18nService } from 'nestjs-i18n';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[] = [],
  ) {}

  async checkboxArgs(i18nService: I18nService): Promise<CheckboxArgs[]> {
    return Promise.all(
      this.allNations.map(async (nation) => ({
        text: await nation.translatedName(i18nService),
        value: nation.code,
        checked: !!this.checkedNations.find(
          (checkedNation) => checkedNation.code === nation.code,
        ),
      })),
    );
  }
}

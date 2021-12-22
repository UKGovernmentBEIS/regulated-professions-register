import { I18nService } from 'nestjs-i18n';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  async checkboxArgs(): Promise<CheckboxArgs[]> {
    return Promise.all(
      this.allNations.map(async (nation) => ({
        text: await nation.translatedName(this.i18nService),
        value: nation.code,
        checked: !!this.checkedNations.find(
          (checkedNation) => checkedNation.code === nation.code,
        ),
      })),
    );
  }
}

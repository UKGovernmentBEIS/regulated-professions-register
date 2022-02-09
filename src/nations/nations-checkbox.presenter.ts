import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  async checkboxItems(): Promise<CheckboxItems[]> {
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

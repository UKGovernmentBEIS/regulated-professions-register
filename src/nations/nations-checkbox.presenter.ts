import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';

import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  checkboxItems(): CheckboxItems[] {
    return this.allNations.map((nation) => ({
        text: nation.translatedName(this.i18nService),
        value: nation.code,
        checked: !!this.checkedNations.find(
          (checkedNation) => checkedNation.code === nation.code,
        ),
      }))
  }

  async checkboxArgs(
    idPrefix: string,
    name: string,
    hintTranslation: string,
  ): Promise<CheckboxArgs> {
    return {
      idPrefix: idPrefix,
      name: name,
      hint: {
        text: await this.i18nService.translate(hintTranslation),
      },
      items: this.checkboxItems(),
    };
  }
}

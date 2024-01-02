import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { sortArrayByProperty } from '../common/utils';
import { Nation } from './nation';

export class NationsCheckboxPresenter {
  constructor(
    private readonly allNations: Nation[],
    private readonly checkedNations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  checkboxItems(): CheckboxItems[] {
    return sortArrayByProperty(
      this.allNations.map((nation) => ({
        text: nation.translatedName(this.i18nService),
        value: nation.code,
        checked: !!this.checkedNations.find(
          (checkedNation) => checkedNation.code === nation.code,
        ),
      })),
      'text',
    );
  }

  checkboxArgs(
    idPrefix: string,
    name: string,
    hintTranslation: string,
  ): CheckboxArgs {
    return {
      idPrefix: idPrefix,
      name: name,
      hint: {
        text: this.i18nService.translate<string>(hintTranslation) as string,
      },
      items: this.checkboxItems(),
    };
  }
}

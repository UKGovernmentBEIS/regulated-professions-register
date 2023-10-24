import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';

export class YesNoRadioButtonArgsPresenter {
  constructor(
    private readonly yesOrNoValue: boolean | null,
    private readonly i18nService: I18nService,
  ) {}

  radioButtonArgs(): RadioButtonArgs[] {
    return [
      {
        value: '1',
        text: this.i18nService.translate<string>('app.yes') as string,
        checked: this.yesOrNoValue === true,
      },
      {
        value: '0',
        text: this.i18nService.translate<string>('app.no') as string,
        checked: this.yesOrNoValue === false,
      },
    ];
  }
}

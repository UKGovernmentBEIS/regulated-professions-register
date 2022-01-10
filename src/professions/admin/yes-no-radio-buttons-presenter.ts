import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';

export class YesNoRadioButtonArgsPresenter {
  constructor(
    private readonly yesOrNoValue: boolean | null,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return [
      {
        value: '1',
        text: await this.i18nService.translate('app.yes'),
        checked: this.yesOrNoValue === true,
      },
      {
        value: '0',
        text: await this.i18nService.translate('app.no'),
        checked: this.yesOrNoValue === false,
      },
    ];
  }
}

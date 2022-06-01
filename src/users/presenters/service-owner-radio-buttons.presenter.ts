import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';

export class ServiceOwnerRadioButtonArgsPresenter {
  constructor(
    private readonly serviceOwner: boolean | null,
    private readonly i18nService: I18nService,
  ) {}

  radioButtonArgs(): RadioButtonArgs[] {
    return [
      {
        value: '1',
        text: this.i18nService.translate<string>(
          'users.form.label.serviceOwner.yes',
        ),
        checked: this.serviceOwner === true,
      },
      {
        value: '0',
        text: this.i18nService.translate<string>(
          'users.form.label.serviceOwner.no',
        ),
        checked: this.serviceOwner === false,
      },
    ];
  }
}

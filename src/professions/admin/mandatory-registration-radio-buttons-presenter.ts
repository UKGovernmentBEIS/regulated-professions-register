import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { MandatoryRegistration } from '../profession.entity';

export class MandatoryRegistrationRadioButtonsPresenter {
  constructor(
    private readonly mandatoryRegistration: MandatoryRegistration | null,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return [
      {
        value: MandatoryRegistration.Mandatory,
        text: await this.i18nService.translate(
          'professions.form.radioButtons.mandatoryRegistration.mandatory',
        ),
        checked: this.mandatoryRegistration === MandatoryRegistration.Mandatory,
      },
      {
        value: MandatoryRegistration.Voluntary,
        text: await this.i18nService.translate(
          'professions.form.radioButtons.mandatoryRegistration.voluntary',
        ),
        checked: this.mandatoryRegistration === MandatoryRegistration.Voluntary,
      },
      {
        value: MandatoryRegistration.Unknown,
        text: await this.i18nService.translate(
          'professions.form.radioButtons.mandatoryRegistration.unknown',
        ),
        checked: this.mandatoryRegistration === MandatoryRegistration.Unknown,
      },
    ];
  }
}

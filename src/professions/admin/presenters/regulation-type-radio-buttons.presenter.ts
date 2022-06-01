import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { RegulationType } from '../../profession-version.entity';

export class RegulationTypeRadioButtonsPresenter {
  constructor(
    private readonly selectedRegulationType: RegulationType | null,
    private readonly i18nService: I18nService,
  ) {}

  radioButtonArgs(): RadioButtonArgs[] {
    return Object.values(RegulationType).map((regulationType) => ({
      text: this.i18nService.translate<string>(
        `professions.regulationTypes.${regulationType}.name`,
      ),
      value: regulationType,
      checked: this.selectedRegulationType === regulationType,
      hint: {
        text: this.i18nService.translate<string>(
          `professions.regulationTypes.${regulationType}.hint`,
        ),
      },
    }));
  }
}

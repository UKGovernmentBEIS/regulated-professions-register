import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { RegulationType } from '../../profession-version.entity';

export class RegulationTypeRadioButtonsPresenter {
  constructor(
    private readonly selectedRegulationType: RegulationType | null,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return Promise.all(
      Object.values(RegulationType).map(async (regulationType) => ({
        text: await this.i18nService.translate(
          `professions.regulationTypes.${regulationType}.name`,
        ),
        value: regulationType,
        checked: this.selectedRegulationType === regulationType,
        hint: {
          text: await this.i18nService.translate(
            `professions.regulationTypes.${regulationType}.hint`,
          ),
        },
      })),
    );
  }
}

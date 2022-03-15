import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { RegulationType } from '../../profession-version.entity';

export class RegulationTypesCheckboxPresenter {
  constructor(
    private readonly checkedRegulationTypes: RegulationType[],
    private readonly i18nService: I18nService,
  ) {}

  async checkboxItems(): Promise<CheckboxItems[]> {
    return Promise.all(
      Object.values(RegulationType).map(async (regulationType) => ({
        text: await this.i18nService.translate(
          `professions.regulationTypes.${regulationType}.name`,
        ),
        value: regulationType,
        checked: this.checkedRegulationTypes.includes(regulationType),
      })),
    );
  }
}

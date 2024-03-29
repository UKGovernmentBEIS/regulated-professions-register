import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { RegulationType } from '../../profession-version.entity';
import { sortArrayByProperty } from '../../../common/utils';

export class RegulationTypesCheckboxPresenter {
  constructor(
    private readonly checkedRegulationTypes: RegulationType[],
    private readonly i18nService: I18nService,
  ) {}

  checkboxItems(): CheckboxItems[] {
    return sortArrayByProperty(
      Object.values(RegulationType).map((regulationType) => ({
        text: this.i18nService.translate<string>(
          `professions.regulationTypes.${regulationType}.name`,
        ) as string,
        value: regulationType,
        checked: this.checkedRegulationTypes.includes(regulationType),
      })),
      'text',
    );
  }
}

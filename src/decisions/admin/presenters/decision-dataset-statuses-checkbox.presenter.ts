import { I18nService } from 'nestjs-i18n';
import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';

export class DecisionDatasetStatusesCheckboxPresenter {
  constructor(
    private readonly checkedStatuses: DecisionDatasetStatus[],
    private readonly i18nService: I18nService,
  ) {}

  checkboxItems(): CheckboxItems[] {
    return Object.values(DecisionDatasetStatus)
      .filter((status) => status !== DecisionDatasetStatus.Unconfirmed)
      .map((status) => ({
        text: this.i18nService.translate<string>(
          `app.status.${status}`,
        ) as string,
        value: status,
        checked: this.checkedStatuses.includes(status),
      }));
  }
}

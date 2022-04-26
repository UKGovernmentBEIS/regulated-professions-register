import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { DecisionDatasetStatus } from '../../decision-dataset.entity';
import { DecisionDatasetStatusesCheckboxPresenter } from './decision-dataset-statuses-checkbox.presenter';

describe('DecisionDatasetStatusesCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    describe('when called with an empty list of statuses', () => {
      it('should return unchecked checkbox arguments', async () => {
        const presenter = new DecisionDatasetStatusesCheckboxPresenter(
          [],
          createMockI18nService(),
        );

        await expect(presenter.checkboxItems()).toEqual([
          {
            text: translationOf('app.status.draft'),
            value: DecisionDatasetStatus.Draft,
            checked: false,
          },
          {
            text: translationOf('app.status.live'),
            value: DecisionDatasetStatus.Live,
            checked: false,
          },
        ]);
      });
    });

    describe('when called with a non-empty list of statuses', () => {
      it('should return some checked checkbox arguments', async () => {
        const presenter = new DecisionDatasetStatusesCheckboxPresenter(
          [DecisionDatasetStatus.Live],
          createMockI18nService(),
        );

        await expect(presenter.checkboxItems()).toEqual([
          {
            text: translationOf('app.status.draft'),
            value: DecisionDatasetStatus.Draft,
            checked: false,
          },
          {
            text: translationOf('app.status.live'),
            value: DecisionDatasetStatus.Live,
            checked: true,
          },
        ]);
      });
    });
  });
});

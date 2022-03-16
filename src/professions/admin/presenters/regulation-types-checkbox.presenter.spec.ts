import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { RegulationType } from '../../profession-version.entity';
import { RegulationTypesCheckboxPresenter } from './regulation-types-checkbox.presenter';

describe('RegulationTypesCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    describe('when called with an empty list of regulation types', () => {
      it('should return unchecked checkbox arguments', async () => {
        const presenter = new RegulationTypesCheckboxPresenter(
          [],
          createMockI18nService(),
        );

        await expect(presenter.checkboxItems()).resolves.toEqual([
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Licensing}.name`,
            ),
            value: RegulationType.Licensing,
            checked: false,
          },
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Certification}.name`,
            ),
            value: RegulationType.Certification,
            checked: false,
          },
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Accreditation}.name`,
            ),
            value: RegulationType.Accreditation,
            checked: false,
          },
        ]);
      });
    });

    describe('when called with a non-empty list of regulation types', () => {
      it('should return some checked checkbox arguments', async () => {
        const presenter = new RegulationTypesCheckboxPresenter(
          [RegulationType.Accreditation, RegulationType.Certification],
          createMockI18nService(),
        );

        await expect(presenter.checkboxItems()).resolves.toEqual([
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Licensing}.name`,
            ),
            value: RegulationType.Licensing,
            checked: false,
          },
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Certification}.name`,
            ),
            value: RegulationType.Certification,
            checked: true,
          },
          {
            text: translationOf(
              `professions.regulationTypes.${RegulationType.Accreditation}.name`,
            ),
            value: RegulationType.Accreditation,
            checked: true,
          },
        ]);
      });
    });
  });
});

import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { RegulationType } from '../../profession-version.entity';
import { RegulationTypeRadioButtonsPresenter } from './regulation-type-radio-buttons.presenter';

describe('RegulationTypeRadioButtonsPresenter', () => {
  describe('radioButtonArgs', () => {
    describe('when the current regulation type is empty', () => {
      it('returns an array of `RadioButtonArgs`, with no option checked', async () => {
        const i18nService = createMockI18nService();

        const presenter = new RegulationTypeRadioButtonsPresenter(
          null,
          i18nService,
        );

        const expected: RadioButtonArgs[] = [
          {
            text: translationOf('professions.regulationTypes.licensing.name'),
            value: 'licensing',
            checked: false,
            hint: {
              text: translationOf('professions.regulationTypes.licensing.hint'),
            },
          },
          {
            text: translationOf(
              'professions.regulationTypes.certification.name',
            ),
            value: 'certification',
            checked: false,
            hint: {
              text: translationOf(
                'professions.regulationTypes.certification.hint',
              ),
            },
          },
          {
            text: translationOf(
              'professions.regulationTypes.accreditation.name',
            ),
            value: 'accreditation',
            checked: false,
            hint: {
              text: translationOf(
                'professions.regulationTypes.accreditation.hint',
              ),
            },
          },
        ];

        await expect(presenter.radioButtonArgs()).resolves.toEqual(expected);
      });
    });

    describe('when the current regulation type is non-empty', () => {
      it('returns an array of `RadioButtonArgs`, with the current regulation type checked', async () => {
        const i18nService = createMockI18nService();

        const presenter = new RegulationTypeRadioButtonsPresenter(
          RegulationType.Certification,
          i18nService,
        );

        const expected: RadioButtonArgs[] = [
          {
            text: translationOf('professions.regulationTypes.licensing.name'),
            value: 'licensing',
            checked: false,
            hint: {
              text: translationOf('professions.regulationTypes.licensing.hint'),
            },
          },
          {
            text: translationOf(
              'professions.regulationTypes.certification.name',
            ),
            value: 'certification',
            checked: true,
            hint: {
              text: translationOf(
                'professions.regulationTypes.certification.hint',
              ),
            },
          },
          {
            text: translationOf(
              'professions.regulationTypes.accreditation.name',
            ),
            value: 'accreditation',
            checked: false,
            hint: {
              text: translationOf(
                'professions.regulationTypes.accreditation.hint',
              ),
            },
          },
        ];

        await expect(presenter.radioButtonArgs()).resolves.toEqual(expected);
      });
    });
  });
});

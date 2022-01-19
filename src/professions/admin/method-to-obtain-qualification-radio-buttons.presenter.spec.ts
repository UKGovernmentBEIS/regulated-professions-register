import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { MethodToObtain } from '../../qualifications/qualification.entity';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { MethodToObtainQualificationRadioButtonsPresenter } from './method-to-obtain-qualification-radio-buttons.presenter';

describe(MethodToObtainQualificationRadioButtonsPresenter, () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    i18nService = createMockI18nService();
  });

  describe('radioButtonArgs', () => {
    it('should return translated values with unchecked radio buttons when called with a null Method to Obtain value', async () => {
      const presenter = new MethodToObtainQualificationRadioButtonsPresenter(
        null,
        undefined,
        undefined,
        i18nService,
      );

      await expect(
        presenter.radioButtonArgs('methodToObtainQualification'),
      ).resolves.toEqual([
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalSecondaryEducation`',
          value: MethodToObtain.GeneralSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalOrVocationalPostSecondaryEducation`',
          value: MethodToObtain.GeneralOrVocationalPostSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalPostSecondaryEducationMandatoryVocational`',
          value:
            MethodToObtain.GeneralPostSecondaryEducationMandatoryVocational,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.vocationalPostSecondaryEducation`',
          value: MethodToObtain.VocationalPostSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.degreeLevel`',
          value: MethodToObtain.DegreeLevel,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.others`',
          value: MethodToObtain.Others,
          checked: false,
          conditional: {
            html: `<div class="govuk-form-group"><div id="methodToObtainQualification-hint" class="govuk-hint">Translation of \`professions.methodsToObtainQualification.otherHint\`</div><textarea class="govuk-textarea" id="otherMethodToObtainQualification" rows="5" name="otherMethodToObtainQualification"></textarea></div>`,
          },
        },
      ]);
    });

    it('should pre-check the relevant radio button for a matching Method to Obtain value', async () => {
      const presenter = new MethodToObtainQualificationRadioButtonsPresenter(
        MethodToObtain.DegreeLevel,
        undefined,
        undefined,
        i18nService,
      );

      await expect(
        presenter.radioButtonArgs('methodToObtainQualification'),
      ).resolves.toEqual([
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalSecondaryEducation`',
          value: MethodToObtain.GeneralSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalOrVocationalPostSecondaryEducation`',
          value: MethodToObtain.GeneralOrVocationalPostSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.generalPostSecondaryEducationMandatoryVocational`',
          value:
            MethodToObtain.GeneralPostSecondaryEducationMandatoryVocational,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.vocationalPostSecondaryEducation`',
          value: MethodToObtain.VocationalPostSecondaryEducation,
          checked: false,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.degreeLevel`',
          value: MethodToObtain.DegreeLevel,
          checked: true,
          conditional: null,
        },
        {
          text: 'Translation of `professions.methodsToObtainQualification.others`',
          value: MethodToObtain.Others,
          checked: false,
          conditional: {
            html: `<div class="govuk-form-group"><div id="methodToObtainQualification-hint" class="govuk-hint">Translation of \`professions.methodsToObtainQualification.otherHint\`</div><textarea class="govuk-textarea" id="otherMethodToObtainQualification" rows="5" name="otherMethodToObtainQualification"></textarea></div>`,
          },
        },
      ]);
    });

    describe('"Other" values', () => {
      describe('for a previously-entered "other" value', () => {
        it('should pre-check that checkbox and pre-fill the user-entered text in the textarea', async () => {
          const presenter =
            new MethodToObtainQualificationRadioButtonsPresenter(
              MethodToObtain.Others,
              'Another method for obtaining the qualification',
              undefined,
              i18nService,
            );

          await expect(
            presenter.radioButtonArgs('methodToObtainQualification'),
          ).resolves.toContainEqual({
            value: MethodToObtain.Others,
            text: 'Translation of `professions.methodsToObtainQualification.others`',
            checked: true,
            conditional: {
              html: `<div class="govuk-form-group"><div id="methodToObtainQualification-hint" class="govuk-hint">Translation of \`professions.methodsToObtainQualification.otherHint\`</div><textarea class="govuk-textarea" id="otherMethodToObtainQualification" rows="5" name="otherMethodToObtainQualification">Another method for obtaining the qualification</textarea></div>`,
            },
          });
        });
      });

      describe('validation errors', () => {
        it('should display an error on the text field', async () => {
          const expectedErrorParagraph =
            '<p id="otherMethodToObtainQualification-error" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> Translation of `professions.form.errors.qualification.otherMostCommonPathToObtain.empty`</p>';

          const expectedErrorFormClass = 'govuk-form-group--error';

          const errors = {
            otherMethodToObtainQualification: {
              text: 'professions.form.errors.qualification.otherMostCommonPathToObtain.empty',
            },
          };

          const presenter =
            new MethodToObtainQualificationRadioButtonsPresenter(
              MethodToObtain.Others,
              undefined,
              errors,
              i18nService,
            );

          await expect(
            presenter.radioButtonArgs('methodToObtainQualification'),
          ).resolves.toContainEqual({
            value: MethodToObtain.Others,
            text: 'Translation of `professions.methodsToObtainQualification.others`',
            checked: true,
            conditional: {
              html: `<div class="govuk-form-group ${expectedErrorFormClass}"><div id="methodToObtainQualification-hint" class="govuk-hint">Translation of \`professions.methodsToObtainQualification.otherHint\`</div>${expectedErrorParagraph}<textarea class="govuk-textarea" id="otherMethodToObtainQualification" rows="5" name="otherMethodToObtainQualification"></textarea></div>`,
            },
          });
        });
      });
    });
  });
});

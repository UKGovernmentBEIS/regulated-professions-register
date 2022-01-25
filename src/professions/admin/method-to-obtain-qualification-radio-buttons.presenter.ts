import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { MethodToObtain } from '../../qualifications/qualification.entity';

export class MethodToObtainQualificationRadioButtonsPresenter {
  constructor(
    private readonly methodToObtain: MethodToObtain | null,
    private readonly otherMethodToObtainText: string | undefined,
    private readonly errors: object | undefined,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(name: string): Promise<RadioButtonArgs[]> {
    return Promise.all(
      Object.values(MethodToObtain).map(async (method) => ({
        value: method,
        text: await this.i18nService.translate(
          `professions.methodsToObtainQualification.${method}`,
        ),
        checked: this.methodToObtain === method,
        conditional: await this.otherMethodTextAreaHTML(
          method,
          name,
          this.otherMethodToObtainText,
          this.errors,
        ),
      })),
    );
  }

  private async otherMethodTextAreaHTML(
    methodToObtain: MethodToObtain,
    name: string,
    otherMethodToObtainText: string | undefined,
    errors: object | undefined = undefined,
  ): Promise<{ html: string } | null> {
    if (methodToObtain !== MethodToObtain.Others) {
      return null;
    }

    const otherFieldName = `other${
      name.charAt(0).toUpperCase() + name.slice(1)
    }`;

    const hintHTML = `<div id="${name}-other-hint" class="govuk-hint">${await this.i18nService.translate(
      'professions.methodsToObtainQualification.otherHint',
    )}</div>`;

    const errorMessageHTML = await this.errorMessageHTML(
      errors,
      otherFieldName,
    );

    const textareaHTML = this.textareaHTML(
      otherFieldName,
      otherMethodToObtainText,
    );

    return {
      html: errorMessageHTML
        ? `<div class="govuk-form-group govuk-form-group--error">${hintHTML}${errorMessageHTML}${textareaHTML}</div>`
        : `<div class="govuk-form-group">${hintHTML}${textareaHTML}</div>`,
    };
  }

  private async errorMessageHTML(
    errors: object | undefined,
    name: string,
  ): Promise<string> {
    if (errors && errors[name] !== undefined) {
      return `<p id="${name}-error" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> ${await this.i18nService.translate(
        errors[name].text,
      )}</p>`;
    }

    return '';
  }

  private textareaHTML(name: string, value: string | undefined): string {
    return value
      ? `<textarea class="govuk-textarea" id="${name}" rows="5" name="${name}">${value}</textarea>`
      : `<textarea class="govuk-textarea" id="${name}" rows="5" name="${name}"></textarea>`;
  }
}

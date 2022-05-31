import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { OtherCountriesRecognitionRoutes } from '../../../qualifications/qualification.entity';

export class OtherCountriesRecognitionRoutesRadioButtonsPresenter {
  constructor(
    private readonly selectedRecognitionRoute: OtherCountriesRecognitionRoutes | null,
    private readonly i18nService: I18nService,
  ) {}

  radioButtonArgs(): RadioButtonArgs[] {
    return Object.values(OtherCountriesRecognitionRoutes).map((route) => ({
      text: this.i18nService.translate<string>(
        `professions.form.label.qualifications.otherCountriesRecognition.routes.${route}`,
      ),
      value: route,
      checked: this.selectedRecognitionRoute === route,
    }));
  }
}

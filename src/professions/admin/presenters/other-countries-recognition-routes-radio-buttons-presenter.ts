import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../../common/interfaces/radio-button-args.interface';
import { OtherCountriesRecognitionRoutes } from '../../../qualifications/qualification.entity';

export class OtherCountriesRecognitionRoutesRadioButtonsPresenter {
  constructor(
    private readonly selectedRecognitionRoute: OtherCountriesRecognitionRoutes | null,
    private readonly i18nService: I18nService,
  ) {}

  async radioButtonArgs(): Promise<RadioButtonArgs[]> {
    return Promise.all(
      Object.values(OtherCountriesRecognitionRoutes).map(async (route) => ({
        text: await this.i18nService.translate(
          `professions.form.label.qualifications.otherCountriesRecognition.routes.${route}`,
        ),
        value: route,
        checked: this.selectedRecognitionRoute === route,
      })),
    );
  }
}

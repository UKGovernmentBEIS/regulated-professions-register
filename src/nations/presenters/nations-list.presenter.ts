import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nation';

export class NationsListPresenter {
  constructor(
    private readonly nations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  async htmlList(): Promise<string> {
    if (this.all()) {
      return this.i18nService.translate('app.unitedKingdom');
    } else {
      const translatedNations = this.translatedNations();

      return translatedNations.length > 0
        ? `<ul class="govuk-list"><li>${translatedNations.join(
            '</li><li>',
          )}</li></ul>`
        : '';
    }
  }

  async textList(): Promise<string> {
    if (this.all()) {
      return this.i18nService.translate('app.unitedKingdom');
    } else {
      return this.translatedNations().join(', ');
    }
  }

  private translatedNations(): string[] {
    return this.nations.map((nation) => nation.translatedName(this.i18nService));
  }

  private all(): boolean {
    return Nation.all().every(
      (nation) =>
        !!this.nations.find((inputNation) => inputNation.code === nation.code),
    );
  }
}

import { I18nService } from 'nestjs-i18n';
import { Nation } from '../nation';

export class NationsListPresenter {
  constructor(
    private readonly nations: Nation[],
    private readonly i18nService: I18nService,
  ) {}

  async textList(): Promise<string> {
    if (this.all()) {
      return this.i18nService.translate('app.unitedKingdom');
    } else {
      return (await this.translatedNations()).join(', ');
    }
  }

  private async translatedNations(): Promise<string[]> {
    return Promise.all(
      this.nations.map((nation) => nation.translatedName(this.i18nService)),
    );
  }

  private all(): boolean {
    return Nation.all().every(
      (nation) =>
        !!this.nations.find((inputNation) => inputNation.code === nation.code),
    );
  }
}

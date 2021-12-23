import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { Profession } from '../profession.entity';
import { ProfessionSearchResultTemplate } from './interfaces/profession-search-result-template.interface';

export class ProfessionSearchResultPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<ProfessionSearchResultTemplate> {
    const nations = await this.getNations(this.i18nService);

    const industries = await Promise.all(
      this.profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    return {
      name: this.profession.name,
      slug: this.profession.slug,
      nations,
      industries,
    };
  }

  private async getNations(i18nService: I18nService): Promise<string> {
    if (
      Nation.all().every((nation) =>
        this.profession.occupationLocations.includes(nation.code),
      )
    ) {
      return i18nService.translate('app.unitedKingdom');
    } else {
      const translatedNations = await Promise.all(
        this.profession.occupationLocations.map((code) =>
          Nation.find(code).translatedName(i18nService),
        ),
      );

      return translatedNations.join(', ');
    }
  }
}

import { I18nService } from 'nestjs-i18n';
import { stringifyNations } from '../../nations/helpers/stringifyNations';
import { Nation } from '../../nations/nation';
import { Profession } from '../profession.entity';
import { ProfessionSearchResultTemplate } from './interfaces/profession-search-result-template.interface';

export class ProfessionSearchResultPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<ProfessionSearchResultTemplate> {
    const nations = await stringifyNations(
      this.profession.occupationLocations.map((code) => Nation.find(code)),
      this.i18nService,
    );

    const industries = await Promise.all(
      this.profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    return {
      name: this.profession.name,
      slug: this.profession.slug,
      organisation: this.profession.organisation.name,
      nations,
      industries,
    };
  }
}

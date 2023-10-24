import { I18nService } from 'nestjs-i18n';
import { Nation } from '../../nations/nation';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';
import { getOrganisationsFromProfession } from '../helpers/get-organisations-from-profession.helper';
import { Profession } from '../profession.entity';
import { ProfessionSearchResultTemplate } from './interfaces/profession-search-result-template.interface';

export class ProfessionSearchResultPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly i18nService: I18nService,
  ) {}

  present(): ProfessionSearchResultTemplate {
    const nations = new NationsListPresenter(
      (this.profession.occupationLocations || []).map((code) =>
        Nation.find(code),
      ),
      this.i18nService,
    ).textList();

    const industries = (this.profession.industries || []).map(
      (industry) => this.i18nService.translate<string>(industry.name) as string,
    );

    const organisations = getOrganisationsFromProfession(this.profession);

    return {
      name: this.profession.name,
      slug: this.profession.slug,
      organisations: organisations.map((organisation) => organisation.name),
      nations,
      industries,
    };
  }
}

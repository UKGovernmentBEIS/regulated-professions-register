import { I18nService } from 'nestjs-i18n';
import { getNationsFromProfessions } from '../../helpers/nations.helper';
import { Profession } from '../../professions/profession.entity';
import { getProfessionsFromOrganisation } from '../helpers/get-professions-from-organisation.helper';
import { Organisation } from '../organisation.entity';
import { OrganisationSearchResultTemplate } from './interfaces/organisation-search-result-template.interface';

export class OrganisationSearchResultPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<OrganisationSearchResultTemplate> {
    const professions = getProfessionsFromOrganisation(this.organisation)
      .map((profession) => Profession.withLatestLiveVersion(profession))
      .filter((n) => n);

    return {
      name: this.organisation.name,
      slug: this.organisation.slug,
      nations: await getNationsFromProfessions(professions, this.i18nService),
    };
  }
}
